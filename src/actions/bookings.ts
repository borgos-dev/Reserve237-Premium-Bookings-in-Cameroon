'use server'

import { db } from '@/db'
import { bookings, listings, businesses, availability } from '@/db/schema'
import { eq, and, or, ilike, inArray, desc, gte, lt, sql } from 'drizzle-orm'
import { sendBookingEmails } from '@/lib/email'
import { checkRateLimit } from '@/lib/rateLimit'
import { headers } from 'next/headers'

// ─── Date conflict check ───────────────────────────────────────────────────────

async function checkDateConflicts(
  listingId: string,
  checkIn: string | null,
  checkOut: string | null,
  bookingDate: string | null
): Promise<string | null> {

  // Date-range bookings (accommodation, car hire)
  if (checkIn && checkOut) {
    // 1. Check blocked availability dates in the requested range
    const [blocked] = await db
      .select({ date: availability.date })
      .from(availability)
      .where(
        and(
          eq(availability.listingId, listingId),
          eq(availability.isBlocked, true),
          gte(availability.date, checkIn),
          lt(availability.date, checkOut)
        )
      )
      .limit(1)

    if (blocked) {
      return `${blocked.date} is not available for booking. Please choose different dates.`
    }

    // 2. Check overlapping confirmed/pending bookings
    // Overlap condition: existingCheckIn < newCheckOut AND existingCheckOut > newCheckIn
    const [overlap] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.listingId, listingId),
          inArray(bookings.status, ['pending', 'confirmed']),
          sql`${bookings.checkIn} < ${checkOut}`,
          sql`${bookings.checkOut} > ${checkIn}`
        )
      )
      .limit(1)

    if (overlap) {
      return 'These dates are already booked. Please choose different dates.'
    }
  }

  // Single-date bookings (restaurants, salons, events)
  if (bookingDate) {
    const [blocked] = await db
      .select({ id: availability.id })
      .from(availability)
      .where(
        and(
          eq(availability.listingId, listingId),
          eq(availability.date, bookingDate),
          eq(availability.isBlocked, true)
        )
      )
      .limit(1)

    if (blocked) {
      return `${bookingDate} is not available. Please choose a different date.`
    }
  }

  return null
}

// ─── Customer: create a booking ───────────────────────────────────────────────

export interface CreateBookingInput {
  listingSlug: string
  userId?: string | null
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn?: string
  checkOut?: string
  bookingDate?: string
  bookingTime?: string
  guests: number
  totalXaf: number
  serviceFeeXaf: number
  paymentMethod: 'mtn-momo' | 'orange-money' | 'card' | 'cash'
  notes?: string
}

export type BookingResult =
  | { success: true; bookingId: string }
  | { success: false; error: string }

export async function createBooking(
  input: CreateBookingInput
): Promise<BookingResult> {
  try {
    // 0. Rate limiting — max 20 booking attempts per IP per hour
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown'

    if (!checkRateLimit(`booking:${ip}`, 20, 60 * 60 * 1000)) {
      return {
        success: false,
        error: 'Too many booking attempts. Please try again in an hour.',
      }
    }

    // 1. Find listing + its business for email notification
    const [listing] = await db
      .select({
        id: listings.id,
        name: listings.name,
        businessId: listings.businessId,
      })
      .from(listings)
      .where(eq(listings.slug, input.listingSlug))
      .limit(1)

    if (!listing) {
      return { success: false, error: 'Listing not found. Please try again.' }
    }

    // 2. Date conflict validation
    const conflict = await checkDateConflicts(
      listing.id,
      input.checkIn ?? null,
      input.checkOut ?? null,
      input.bookingDate ?? null
    )
    if (conflict) {
      return { success: false, error: conflict }
    }

    // 3. Insert booking
    const [booking] = await db
      .insert(bookings)
      .values({
        listingId: listing.id,
        userId: input.userId ?? null,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        checkIn: input.checkIn ?? null,
        checkOut: input.checkOut ?? null,
        bookingDate: input.bookingDate ?? null,
        bookingTime: input.bookingTime ?? null,
        guests: input.guests,
        totalXaf: input.totalXaf,
        serviceFeeXaf: input.serviceFeeXaf,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        notes: input.notes ?? null,
      })
      .returning({ id: bookings.id })

    // 4. Send confirmation emails — fire-and-forget, never blocks the UI
    if (listing.businessId) {
      const [business] = await db
        .select({ email: businesses.email, name: businesses.name })
        .from(businesses)
        .where(eq(businesses.id, listing.businessId))
        .limit(1)

      const dates =
        input.checkIn && input.checkOut
          ? `${input.checkIn} → ${input.checkOut}`
          : input.bookingDate
          ? `${input.bookingDate}${input.bookingTime ? ` · ${input.bookingTime}` : ''}`
          : 'Contact for details'

      sendBookingEmails({
        customerEmail: input.guestEmail,
        customerName: input.guestName,
        customerPhone: input.guestPhone,
        partnerEmail: business?.email,
        partnerName: business?.name,
        listingName: listing.name,
        bookingRef: booking.id.slice(0, 8).toUpperCase(),
        dates,
        guests: input.guests,
        totalXaf: input.totalXaf,
        paymentMethod: input.paymentMethod,
      }).catch((err) => console.error('[createBooking] email error:', err))
    }

    return { success: true, bookingId: booking.id }
  } catch (err) {
    console.error('[createBooking]', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

// ─── Partner: get all bookings for their listings ─────────────────────────────

export interface PartnerBooking {
  id: string
  listingId: string
  listingName: string
  listingCategory: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string | null
  checkOut: string | null
  bookingDate: string | null
  bookingTime: string | null
  guests: number
  totalXaf: number
  serviceFeeXaf: number
  paymentMethod: string
  paymentStatus: string
  status: string
  notes: string | null
  createdAt: Date
}

export async function getPartnerBookings(
  userId: string,
  filters?: { status?: string; search?: string }
): Promise<PartnerBooking[]> {
  const partnerListings = await db
    .select({ id: listings.id, name: listings.name, category: listings.mainCategory })
    .from(listings)
    .innerJoin(businesses, eq(listings.businessId, businesses.id))
    .where(eq(businesses.ownerId, userId))

  if (partnerListings.length === 0) return []

  const listingIds = partnerListings.map((l) => l.id)
  const listingMap = Object.fromEntries(
    partnerListings.map((l) => [l.id, { name: l.name, category: l.category ?? '' }])
  )

  const conditions = [inArray(bookings.listingId, listingIds)]

  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(bookings.status, filters.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'))
  }

  if (filters?.search?.trim()) {
    conditions.push(
      or(
        ilike(bookings.guestName, `%${filters.search}%`),
        ilike(bookings.guestEmail, `%${filters.search}%`),
        ilike(bookings.guestPhone, `%${filters.search}%`)
      )!
    )
  }

  const rows = await db
    .select()
    .from(bookings)
    .where(and(...conditions))
    .orderBy(desc(bookings.createdAt))

  return rows.map((b) => ({
    id: b.id,
    listingId: b.listingId,
    listingName: listingMap[b.listingId]?.name ?? 'Unknown listing',
    listingCategory: listingMap[b.listingId]?.category ?? '',
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    guestPhone: b.guestPhone,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    bookingDate: b.bookingDate,
    bookingTime: b.bookingTime,
    guests: b.guests,
    totalXaf: b.totalXaf,
    serviceFeeXaf: b.serviceFeeXaf,
    paymentMethod: b.paymentMethod,
    paymentStatus: b.paymentStatus,
    status: b.status,
    notes: b.notes,
    createdAt: b.createdAt,
  }))
}

// ─── Partner: update booking status ──────────────────────────────────────────

export type BookingStatusUpdate = 'confirmed' | 'cancelled' | 'completed'

export async function updateBookingStatus(
  bookingId: string,
  userId: string,
  status: BookingStatusUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    const [row] = await db
      .select({ bookingId: bookings.id })
      .from(bookings)
      .innerJoin(listings, eq(bookings.listingId, listings.id))
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(businesses.ownerId, userId)
        )
      )
      .limit(1)

    if (!row) return { success: false, error: 'Booking not found or access denied.' }

    await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId))

    return { success: true }
  } catch (err) {
    console.error('[updateBookingStatus]', err)
    return { success: false, error: 'Failed to update booking.' }
  }
}
