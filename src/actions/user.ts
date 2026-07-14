'use server'

import { db } from '@/db'
import { bookings, listings, reviews } from '@/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'

export interface UserBooking {
  id: string
  listingId: string        // UUID — needed for review submission
  listingName: string
  listingSlug: string
  listingImage: string | null
  checkIn: string | null
  checkOut: string | null
  bookingDate: string | null
  bookingTime: string | null
  guests: number
  totalXaf: number
  serviceFeeXaf: number
  paymentMethod: string
  status: string
  hasReviewed: boolean     // whether user already left a review for this booking
  createdAt: Date
}

export async function getUserBookings(userId: string): Promise<UserBooking[]> {
  const rows = await db
    .select({
      id: bookings.id,
      listingId: bookings.listingId,
      listingName: listings.name,
      listingSlug: listings.slug,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      bookingDate: bookings.bookingDate,
      bookingTime: bookings.bookingTime,
      guests: bookings.guests,
      totalXaf: bookings.totalXaf,
      serviceFeeXaf: bookings.serviceFeeXaf,
      paymentMethod: bookings.paymentMethod,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(listings, eq(bookings.listingId, listings.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt))

  if (rows.length === 0) return []

  // Check which bookings already have a review
  const bookingIds = rows.map((r) => r.id)
  const existingReviews = await db
    .select({ bookingId: reviews.bookingId })
    .from(reviews)
    .where(inArray(reviews.bookingId, bookingIds))

  const reviewedSet = new Set(existingReviews.map((r) => r.bookingId).filter(Boolean))

  return rows.map((r) => ({
    ...r,
    listingImage: null,
    hasReviewed: reviewedSet.has(r.id),
  }))
}
