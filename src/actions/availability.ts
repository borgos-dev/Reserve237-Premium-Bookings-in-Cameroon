'use server'

import { db } from '@/db'
import { availability, bookings, listings, businesses } from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'

// ─── Verify listing ownership ──────────────────────────────────────────────────

async function verifyOwnership(listingId: string, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: listings.id })
    .from(listings)
    .innerJoin(businesses, eq(listings.businessId, businesses.id))
    .where(and(eq(listings.id, listingId), eq(businesses.ownerId, userId)))
    .limit(1)
  return !!row
}

// ─── Get blocked dates for a listing ─────────────────────────────────────────

export async function getListingAvailability(listingId: string): Promise<string[]> {
  const rows = await db
    .select({ date: availability.date })
    .from(availability)
    .where(and(eq(availability.listingId, listingId), eq(availability.isBlocked, true)))
  return rows.map((r) => r.date)
}

// ─── Get dates that have real bookings (pending or confirmed) ─────────────────

export async function getBookedDates(listingId: string): Promise<string[]> {
  const rows = await db
    .select({
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      bookingDate: bookings.bookingDate,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.listingId, listingId),
        inArray(bookings.status, ['pending', 'confirmed'])
      )
    )

  const dates = new Set<string>()

  for (const row of rows) {
    // Single-date booking (restaurant, salon, etc.)
    if (row.bookingDate) {
      dates.add(row.bookingDate)
    }
    // Date-range booking (accommodation)
    if (row.checkIn && row.checkOut) {
      const start = new Date(row.checkIn)
      const end = new Date(row.checkOut)
      const cur = new Date(start)
      while (cur <= end) {
        dates.add(cur.toISOString().slice(0, 10))
        cur.setDate(cur.getDate() + 1)
      }
    }
  }

  return Array.from(dates)
}

// ─── Toggle a single date blocked / unblocked ────────────────────────────────

export async function toggleDateBlocked(
  listingId: string,
  userId: string,
  date: string
): Promise<{ success: boolean; isNowBlocked: boolean; error?: string }> {
  const owned = await verifyOwnership(listingId, userId)
  if (!owned) return { success: false, isNowBlocked: false, error: 'Unauthorized.' }

  const [existing] = await db
    .select({ id: availability.id })
    .from(availability)
    .where(and(eq(availability.listingId, listingId), eq(availability.date, date)))
    .limit(1)

  if (existing) {
    await db.delete(availability).where(eq(availability.id, existing.id))
    return { success: true, isNowBlocked: false }
  } else {
    await db.insert(availability).values({ listingId, date, isBlocked: true })
    return { success: true, isNowBlocked: true }
  }
}

// ─── Block a date range ───────────────────────────────────────────────────────

export async function blockDateRange(
  listingId: string,
  userId: string,
  startDate: string,
  endDate: string,
  reason?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  const owned = await verifyOwnership(listingId, userId)
  if (!owned) return { success: false, count: 0, error: 'Unauthorized.' }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (start > end) return { success: false, count: 0, error: 'Start date must be before end date.' }

  // Collect all dates in range not already blocked
  const existing = await db
    .select({ date: availability.date })
    .from(availability)
    .where(eq(availability.listingId, listingId))

  const alreadyBlocked = new Set(existing.map((r) => r.date))

  const toInsert: { listingId: string; date: string; isBlocked: boolean; reason: string | null }[] = []
  const cur = new Date(start)
  while (cur <= end) {
    const d = cur.toISOString().slice(0, 10)
    if (!alreadyBlocked.has(d)) {
      toInsert.push({ listingId, date: d, isBlocked: true, reason: reason ?? null })
    }
    cur.setDate(cur.getDate() + 1)
  }

  if (toInsert.length > 0) {
    await db.insert(availability).values(toInsert)
  }

  return { success: true, count: toInsert.length }
}

// ─── Unblock all dates in a range ────────────────────────────────────────────

export async function unblockDateRange(
  listingId: string,
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; error?: string }> {
  const owned = await verifyOwnership(listingId, userId)
  if (!owned) return { success: false, error: 'Unauthorized.' }

  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates: string[] = []
  const cur = new Date(start)
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }

  if (dates.length > 0) {
    await db
      .delete(availability)
      .where(
        and(
          eq(availability.listingId, listingId),
          inArray(availability.date, dates)
        )
      )
  }

  return { success: true }
}
