'use server'

import { db } from '@/db'
import { reviews, bookings, listings } from '@/db/schema'
import { eq, and, avg, count } from 'drizzle-orm'
import { checkRateLimit } from '@/lib/rateLimit'
import { headers } from 'next/headers'

// ─── Public review type ───────────────────────────────────────────────────────

export interface PublicReview {
  id: string
  authorName: string
  rating: number
  body: string | null
  reply: string | null
  createdAt: Date
}

// ─── Get all reviews for a listing ───────────────────────────────────────────

export async function getListingReviews(listingId: string): Promise<PublicReview[]> {
  const rows = await db
    .select({
      id: reviews.id,
      authorName: reviews.authorName,
      rating: reviews.rating,
      body: reviews.body,
      reply: reviews.reply,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.listingId, listingId))
    .orderBy(reviews.createdAt)

  return rows
}

// ─── Check if user already reviewed a specific booking ───────────────────────

export async function hasUserReviewedBooking(bookingId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.bookingId, bookingId))
    .limit(1)
  return !!row
}

// ─── Submit a review ──────────────────────────────────────────────────────────

export interface SubmitReviewInput {
  bookingId: string
  userId: string
  authorName: string
  rating: number       // 1–5
  body?: string
}

export type ReviewResult =
  | { success: true; reviewId: string }
  | { success: false; error: string }

export async function submitReview(input: SubmitReviewInput): Promise<ReviewResult> {
  try {
    if (input.rating < 1 || input.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5.' }
    }

    // Rate limiting — max 10 review submissions per IP per hour
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown'

    if (!checkRateLimit(`review:${ip}`, 10, 60 * 60 * 1000)) {
      return {
        success: false,
        error: 'Too many review submissions. Please try again later.',
      }
    }

    // Verify booking exists and belongs to this user
    const [booking] = await db
      .select({ id: bookings.id, listingId: bookings.listingId, status: bookings.status, userId: bookings.userId })
      .from(bookings)
      .where(and(eq(bookings.id, input.bookingId), eq(bookings.userId, input.userId)))
      .limit(1)

    if (!booking) {
      return { success: false, error: 'Booking not found.' }
    }

    // Allow reviews for confirmed and completed bookings
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      return { success: false, error: 'You can only review confirmed or completed bookings.' }
    }

    // Prevent duplicate reviews for the same booking
    const alreadyReviewed = await hasUserReviewedBooking(input.bookingId)
    if (alreadyReviewed) {
      return { success: false, error: 'You have already reviewed this booking.' }
    }

    // Insert review
    const [review] = await db
      .insert(reviews)
      .values({
        listingId: booking.listingId,
        bookingId: input.bookingId,
        userId: input.userId,
        authorName: input.authorName,
        rating: input.rating,
        body: input.body?.trim() || null,
      })
      .returning({ id: reviews.id })

    // Recalculate listing rating + review count
    const [stats] = await db
      .select({
        avgRating: avg(reviews.rating),
        totalCount: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.listingId, booking.listingId))

    if (stats) {
      await db
        .update(listings)
        .set({
          rating: stats.avgRating ? parseFloat(stats.avgRating).toFixed(2) : '0',
          reviewCount: stats.totalCount,
          updatedAt: new Date(),
        })
        .where(eq(listings.id, booking.listingId))
    }

    return { success: true, reviewId: review.id }
  } catch (err) {
    console.error('[submitReview]', err)
    return { success: false, error: 'Failed to submit review. Please try again.' }
  }
}
