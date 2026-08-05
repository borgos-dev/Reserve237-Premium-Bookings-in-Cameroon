'use server'

import { db } from '@/db'
import { bookings, listings, businesses, availability } from '@/db/schema'
import { eq, and, or, ilike, inArray, desc, gte, lt, sql } from 'drizzle-orm'
import { sendBookingEmails, sendBookingStatusEmail, sendBookingNoticeEmail } from '@/lib/email'
import {
  sendSms,
  newBookingSms,
  bookingStatusSms,
  clientCancelledSms,
} from '@/lib/sms'
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

const SERVICE_FEE_RATE = 0.07

function capacityFromDetails(details: unknown): number | null {
  const c = (details as { capacity?: unknown } | null)?.capacity
  return typeof c === 'number' && c > 0 ? c : null
}

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
  paymentMethod: 'mtn-momo' | 'orange-money' | 'card' | 'cash'
  notes?: string
  // Diaspora gifting — guest* fields above hold the beneficiary in Cameroon,
  // booker* fields hold the payer (usually abroad)
  isGift?: boolean
  bookerName?: string
  bookerEmail?: string
  bookerPhone?: string
  giftMessage?: string
}

export type BookingResult =
  | { success: true; bookingId: string; bookingRef: string; totalXaf: number; serviceFeeXaf: number }
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

    // 1. Find listing (price + capacity are the pricing source of truth)
    const [listing] = await db
      .select({
        id: listings.id,
        name: listings.name,
        businessId: listings.businessId,
        priceMin: listings.priceMin,
        mainCategory: listings.mainCategory,
        details: listings.details,
      })
      .from(listings)
      .where(eq(listings.slug, input.listingSlug))
      .limit(1)

    if (!listing) {
      return { success: false, error: 'Listing not found. Please try again.' }
    }
    if (listing.priceMin == null || listing.priceMin <= 0) {
      return { success: false, error: 'This listing cannot be booked online. Please contact the venue.' }
    }

    // 2. Validate guests against the listing's capacity
    const capacity = capacityFromDetails(listing.details) ?? 20
    const guests = Math.round(input.guests)
    if (!Number.isFinite(guests) || guests < 1 || guests > capacity) {
      return { success: false, error: `Guests must be between 1 and ${capacity}.` }
    }

    // 3. Validate dates
    const isAccommodation = listing.mainCategory === 'accommodation'
    const todayStr = new Date().toISOString().slice(0, 10)
    let nights = 0
    if (isAccommodation) {
      if (!input.checkIn || !input.checkOut) {
        return { success: false, error: 'Please select check-in and check-out dates.' }
      }
      if (input.checkIn < todayStr) {
        return { success: false, error: 'Check-in date cannot be in the past.' }
      }
      nights = Math.round(
        (new Date(input.checkOut).getTime() - new Date(input.checkIn).getTime()) / 86_400_000
      )
      if (!Number.isFinite(nights) || nights < 1) {
        return { success: false, error: 'Check-out must be after check-in.' }
      }
    } else {
      if (!input.bookingDate) {
        return { success: false, error: 'Please select a date.' }
      }
      if (input.bookingDate < todayStr) {
        return { success: false, error: 'The booking date cannot be in the past.' }
      }
    }

    // 4. Date conflict validation
    const conflict = await checkDateConflicts(
      listing.id,
      isAccommodation ? input.checkIn! : null,
      isAccommodation ? input.checkOut! : null,
      isAccommodation ? null : input.bookingDate!
    )
    if (conflict) {
      return { success: false, error: conflict }
    }

    // 5. Recompute price server-side — never trust client totals
    const subtotal = isAccommodation
      ? listing.priceMin * nights * guests
      : listing.priceMin * guests
    const serviceFeeXaf = Math.round(subtotal * SERVICE_FEE_RATE)
    const totalXaf = subtotal + serviceFeeXaf

    // 6. Insert booking
    const isGift = input.isGift === true
    const [booking] = await db
      .insert(bookings)
      .values({
        listingId: listing.id,
        userId: input.userId ?? null,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        checkIn: isAccommodation ? input.checkIn! : null,
        checkOut: isAccommodation ? input.checkOut! : null,
        bookingDate: isAccommodation ? null : input.bookingDate!,
        bookingTime: isAccommodation ? null : input.bookingTime ?? null,
        guests,
        totalXaf,
        serviceFeeXaf,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        notes: input.notes ?? null,
        isGift,
        bookerName: isGift ? input.bookerName ?? null : null,
        bookerEmail: isGift ? input.bookerEmail ?? null : null,
        bookerPhone: isGift ? input.bookerPhone ?? null : null,
        giftMessage: isGift ? input.giftMessage ?? null : null,
      })
      .returning({ id: bookings.id })

    const bookingRef = booking.id.slice(0, 8).toUpperCase()

    // 7. Send confirmation emails — fire-and-forget, never blocks the UI
    if (listing.businessId) {
      const [business] = await db
        .select({
          email: businesses.email,
          name: businesses.name,
          phone: businesses.phone,
          whatsapp: businesses.whatsapp,
        })
        .from(businesses)
        .where(eq(businesses.id, listing.businessId))
        .limit(1)

      const dates =
        isAccommodation
          ? `${input.checkIn} → ${input.checkOut}`
          : `${input.bookingDate}${input.bookingTime ? ` · ${input.bookingTime}` : ''}`

      sendBookingEmails({
        // For gifts the confirmation goes to the payer; the venue still sees
        // the beneficiary as the guest arriving.
        customerEmail: isGift && input.bookerEmail ? input.bookerEmail : input.guestEmail,
        customerName: isGift && input.bookerName ? input.bookerName : input.guestName,
        customerPhone: input.guestPhone,
        partnerEmail: business?.email,
        partnerName: business?.name,
        listingName: listing.name,
        bookingRef,
        dates,
        guests,
        totalXaf,
        paymentMethod: input.paymentMethod,
        isGift,
        beneficiaryName: isGift ? input.guestName : undefined,
      }).catch((err) => console.error('[createBooking] email error:', err))

      // Email lands in an inbox the partner may not check for hours. The SMS is
      // what actually reaches them, which is the difference between a confirmed
      // booking and a guest who gave up and phoned somewhere else.
      sendSms(
        business?.phone ?? business?.whatsapp,
        newBookingSms({
          listingName: listing.name,
          bookingRef,
          dates,
          guests,
          guestName: input.guestName,
          guestPhone: input.guestPhone,
        })
      ).catch((err) => console.error('[createBooking] sms error:', err))
    }

    return { success: true, bookingId: booking.id, bookingRef, totalXaf, serviceFeeXaf }
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
  isGift: boolean
  bookerName: string | null
  bookerPhone: string | null
  giftMessage: string | null
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
    isGift: b.isGift,
    bookerName: b.bookerName,
    bookerPhone: b.bookerPhone,
    giftMessage: b.giftMessage,
    createdAt: b.createdAt,
  }))
}

// ─── Carrying the answer back ────────────────────────────────────────────────
// Reserve237 doesn't decide a booking — the business does. But the platform is
// the only thing standing between the two parties, so it has to deliver the
// decision. Every status change goes out on both channels: email (free, always
// on) and SMS (read on a phone, which is where Cameroon actually is).

function bookingDates(b: {
  checkIn: string | null
  checkOut: string | null
  bookingDate: string | null
  bookingTime: string | null
}): string {
  if (b.checkIn && b.checkOut) return `${b.checkIn} → ${b.checkOut}`
  if (b.checkIn) return b.checkIn
  if (b.bookingDate) return b.bookingTime ? `${b.bookingDate} · ${b.bookingTime}` : b.bookingDate
  return '—'
}

/** The date a booking is actually for — used for the cancellation window. */
function serviceDate(b: { checkIn: string | null; bookingDate: string | null }): string | null {
  return b.checkIn ?? b.bookingDate
}

const bookingWithVenue = {
  id: bookings.id,
  userId: bookings.userId,
  status: bookings.status,
  guestName: bookings.guestName,
  guestEmail: bookings.guestEmail,
  guestPhone: bookings.guestPhone,
  bookerEmail: bookings.bookerEmail,
  bookerName: bookings.bookerName,
  isGift: bookings.isGift,
  checkIn: bookings.checkIn,
  checkOut: bookings.checkOut,
  bookingDate: bookings.bookingDate,
  bookingTime: bookings.bookingTime,
  guests: bookings.guests,
  listingName: listings.name,
  businessName: businesses.name,
  businessEmail: businesses.email,
  businessPhone: businesses.phone,
  businessWhatsapp: businesses.whatsapp,
  ownerId: businesses.ownerId,
}

/** Everything the two notification helpers below need to write a message. */
interface BookingNotice {
  id: string
  isGift: boolean
  guestName: string
  guestEmail: string
  guestPhone: string
  bookerName: string | null
  bookerEmail: string | null
  checkIn: string | null
  checkOut: string | null
  bookingDate: string | null
  bookingTime: string | null
  guests: number
  listingName: string
  businessName: string
  businessEmail: string | null
  businessPhone: string | null
  businessWhatsapp: string | null
}

/** Tells the client what the business decided. Fire-and-forget. */
async function notifyClient(
  b: BookingNotice,
  status: 'confirmed' | 'cancelled' | 'completed',
  opts?: { reason?: string | null; cancelledBy?: 'partner' | 'customer' }
): Promise<void> {
  const ref = b.id.slice(0, 8).toUpperCase()
  const dates = bookingDates(b)
  // For a gift the payer is the one who needs to hear back, not the beneficiary.
  const email = b.isGift && b.bookerEmail ? b.bookerEmail : b.guestEmail
  const name = b.isGift && b.bookerName ? b.bookerName : b.guestName

  await Promise.allSettled([
    sendBookingStatusEmail({
      customerEmail: email,
      customerName: name,
      listingName: b.listingName,
      bookingRef: ref,
      dates,
      guests: b.guests,
      status,
      reason: opts?.reason,
      cancelledBy: opts?.cancelledBy,
      partnerPhone: b.businessPhone ?? b.businessWhatsapp,
    }),
    sendSms(
      b.guestPhone,
      bookingStatusSms({ listingName: b.listingName, bookingRef: ref, dates, guests: b.guests, status })
    ),
  ])
}

/** Tells the business the client pulled out, so the slot is knowingly free. */
async function notifyBusinessOfCancellation(b: BookingNotice, reason?: string | null): Promise<void> {
  const ref = b.id.slice(0, 8).toUpperCase()
  const dates = bookingDates(b)

  await Promise.allSettled([
    sendBookingNoticeEmail({
      toEmail: b.businessEmail ?? '',
      toName: b.businessName,
      listingName: b.listingName,
      bookingRef: ref,
      dates,
      guests: b.guests,
      statusLabel: 'Cancelled by client / Annulée par le client',
      message: [
        `${b.guestName} (${b.guestPhone}) cancelled their booking at ${b.listingName}.`,
        `When: ${dates} · ${b.guests} guest(s) · Reference ${ref}`,
        reason ? `Reason: ${reason}` : 'No reason given.',
        'These dates are free again for other bookings.',
        '',
        `${b.guestName} (${b.guestPhone}) a annulé sa réservation du ${dates}. `,
        `Le créneau est de nouveau disponible.`,
      ].join('\n'),
    }),
    sendSms(
      b.businessPhone ?? b.businessWhatsapp,
      clientCancelledSms({
        listingName: b.listingName,
        bookingRef: ref,
        dates,
        guests: b.guests,
        guestName: b.guestName,
      })
    ),
  ])
}

// ─── Partner: update booking status ──────────────────────────────────────────

export type BookingStatusUpdate = 'confirmed' | 'cancelled' | 'completed'

export async function updateBookingStatus(
  bookingId: string,
  userId: string,
  status: BookingStatusUpdate,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [row] = await db
      .select(bookingWithVenue)
      .from(bookings)
      .innerJoin(listings, eq(bookings.listingId, listings.id))
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(and(eq(bookings.id, bookingId), eq(businesses.ownerId, userId)))
      .limit(1)

    if (!row) return { success: false, error: 'Booking not found or access denied.' }

    const cancelling = status === 'cancelled'
    await db
      .update(bookings)
      .set({
        status,
        updatedAt: new Date(),
        ...(cancelling
          ? {
              cancelledAt: new Date(),
              cancelledBy: 'partner' as const,
              cancellationReason: reason?.trim() || null,
            }
          : {}),
      })
      .where(eq(bookings.id, bookingId))

    // The decision is worthless to the client if it never leaves the dashboard.
    void notifyClient(row, status, {
      reason: cancelling ? reason ?? null : null,
      cancelledBy: cancelling ? 'partner' : undefined,
    }).catch((err) => console.error('[updateBookingStatus] notify error:', err))

    return { success: true }
  } catch (err) {
    console.error('[updateBookingStatus]', err)
    return { success: false, error: 'Failed to update booking.' }
  }
}

// ─── Customer: cancel your own booking ───────────────────────────────────────
// Deliberately a separate action. updateBookingStatus authorises by business
// ownership, which a customer can never satisfy — pointing the profile page at
// it meant every customer cancellation failed.

/** Cancellation stays open until the booking date has passed. */
function cancellableError(b: { status: string; checkIn: string | null; bookingDate: string | null }): string | null {
  if (b.status === 'cancelled') return 'This booking is already cancelled.'
  if (b.status === 'completed') return 'This booking is already completed and cannot be cancelled.'
  const when = serviceDate(b)
  if (when && when < new Date().toISOString().slice(0, 10)) {
    return 'This booking date has already passed. Please contact the venue directly.'
  }
  return null
}

export async function cancelOwnBooking(
  bookingId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [row] = await db
      .select(bookingWithVenue)
      .from(bookings)
      .innerJoin(listings, eq(bookings.listingId, listings.id))
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
      .limit(1)

    if (!row) return { success: false, error: 'Booking not found or access denied.' }

    const blocked = cancellableError(row)
    if (blocked) return { success: false, error: blocked }

    await db
      .update(bookings)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: 'customer',
        cancellationReason: reason?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))

    void notifyBusinessOfCancellation(row, reason).catch((err) =>
      console.error('[cancelOwnBooking] notify error:', err)
    )
    void notifyClient(row, 'cancelled', { reason, cancelledBy: 'customer' }).catch((err) =>
      console.error('[cancelOwnBooking] receipt error:', err)
    )

    return { success: true }
  } catch (err) {
    console.error('[cancelOwnBooking]', err)
    return { success: false, error: 'Failed to cancel booking.' }
  }
}

// ─── Guest: look up and cancel without an account ────────────────────────────
// Booking never required sign-in, but every status surface did — so guests
// could book and then never learn anything again. Reference + the phone or
// email used to book acts as the shared secret; both must match.

export interface GuestBookingView {
  id: string
  ref: string
  listingName: string
  listingSlug: string
  businessName: string
  businessPhone: string | null
  dates: string
  guests: number
  totalXaf: number
  status: string
  cancellationReason: string | null
  canCancel: boolean
}

async function findGuestBooking(ref: string, contact: string) {
  const cleanRef = ref.trim().toUpperCase()
  const cleanContact = contact.trim().toLowerCase()
  if (cleanRef.length !== 8 || !cleanContact) return null

  const [row] = await db
    .select({
      ...bookingWithVenue,
      listingSlug: listings.slug,
      totalXaf: bookings.totalXaf,
      cancellationReason: bookings.cancellationReason,
    })
    .from(bookings)
    .innerJoin(listings, eq(bookings.listingId, listings.id))
    .innerJoin(businesses, eq(listings.businessId, businesses.id))
    // Postgres uuids render lowercase; the reference shown to guests is the
    // first 8 characters upper-cased.
    .where(sql`upper(left(${bookings.id}::text, 8)) = ${cleanRef}`)
    .limit(1)

  if (!row) return null

  // The reference alone must not be enough — it is short and printable.
  const phoneDigits = row.guestPhone.replace(/\D/g, '')
  const contactDigits = cleanContact.replace(/\D/g, '')
  const matches =
    row.guestEmail.toLowerCase() === cleanContact ||
    (row.bookerEmail?.toLowerCase() ?? '') === cleanContact ||
    (contactDigits.length >= 8 && phoneDigits.endsWith(contactDigits.slice(-8)))

  return matches ? row : null
}

export async function lookupGuestBooking(
  ref: string,
  contact: string
): Promise<{ success: true; booking: GuestBookingView } | { success: false; error: string }> {
  try {
    const row = await findGuestBooking(ref, contact)
    if (!row) {
      return {
        success: false,
        error: 'No booking matches that reference and contact. Check both and try again.',
      }
    }

    return {
      success: true,
      booking: {
        id: row.id,
        ref: row.id.slice(0, 8).toUpperCase(),
        listingName: row.listingName,
        listingSlug: row.listingSlug,
        businessName: row.businessName,
        businessPhone: row.businessPhone ?? row.businessWhatsapp,
        dates: bookingDates(row),
        guests: row.guests,
        totalXaf: row.totalXaf,
        status: row.status,
        cancellationReason: row.cancellationReason,
        canCancel: cancellableError(row) === null,
      },
    }
  } catch (err) {
    console.error('[lookupGuestBooking]', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function cancelGuestBooking(
  ref: string,
  contact: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const row = await findGuestBooking(ref, contact)
    if (!row) return { success: false, error: 'Booking not found.' }

    const blocked = cancellableError(row)
    if (blocked) return { success: false, error: blocked }

    await db
      .update(bookings)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: 'customer',
        cancellationReason: reason?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, row.id))

    void notifyBusinessOfCancellation(row, reason).catch((err) =>
      console.error('[cancelGuestBooking] notify error:', err)
    )
    void notifyClient(row, 'cancelled', { reason, cancelledBy: 'customer' }).catch((err) =>
      console.error('[cancelGuestBooking] receipt error:', err)
    )

    return { success: true }
  } catch (err) {
    console.error('[cancelGuestBooking]', err)
    return { success: false, error: 'Failed to cancel booking.' }
  }
}
