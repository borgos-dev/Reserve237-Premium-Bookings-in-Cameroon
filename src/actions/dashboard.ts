'use server'

import { db } from '@/db'
import { bookings, listings, businesses, listingImages, availability } from '@/db/schema'
import { eq, sql, inArray, and } from 'drizzle-orm'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WeekDay {
  day: string       // "Mon", "Tue", …
  bookings: number  // count for that day
  revenueXaf: number
  h: number         // 0–100 height % relative to the busiest day this week
}

export interface DashboardStats {
  totalListings: number
  activeListings: number
  todayBookings: number
  pendingBookings: number
  totalRevenueXaf: number
  recentBookings: RecentBooking[]
  weeklyData: WeekDay[]
  // Onboarding checklist flags
  hasPhotos: boolean           // at least one listing has a photo uploaded
  hasAvailabilitySet: boolean  // at least one availability rule exists
  hasProfileComplete: boolean  // business has phone or WhatsApp set
}

export interface RecentBooking {
  id: string
  guestName: string
  listingName: string
  checkIn: string | null
  bookingDate: string | null
  bookingTime: string | null
  guests: number
  totalXaf: number
  status: string
  paymentMethod: string
  createdAt: Date
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function emptyWeek(): WeekDay[] {
  const days: WeekDay[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      bookings: 0,
      revenueXaf: 0,
      h: 0,
    })
  }
  return days
}

// ─── Main query ───────────────────────────────────────────────────────────────

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [business] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerId, userId))
    .limit(1)

  if (!business) {
    return {
      totalListings: 0, activeListings: 0, todayBookings: 0,
      pendingBookings: 0, totalRevenueXaf: 0,
      recentBookings: [], weeklyData: emptyWeek(),
      hasPhotos: false, hasAvailabilitySet: false, hasProfileComplete: false,
    }
  }

  const partnerListings = await db
    .select({ id: listings.id, name: listings.name, active: listings.active })
    .from(listings)
    .where(eq(listings.businessId, business.id))

  const listingIds = partnerListings.map((l) => l.id)
  const totalListings = partnerListings.length
  const activeListings = partnerListings.filter((l) => l.active).length

  // Get full business record to check profile completeness
  const [businessData] = await db
    .select({ phone: businesses.phone, whatsapp: businesses.whatsapp })
    .from(businesses)
    .where(eq(businesses.id, business.id))
    .limit(1)

  const hasProfileComplete = !!(businessData?.phone || businessData?.whatsapp)

  if (listingIds.length === 0) {
    return {
      totalListings, activeListings, todayBookings: 0,
      pendingBookings: 0, totalRevenueXaf: 0,
      recentBookings: [], weeklyData: emptyWeek(),
      hasPhotos: false, hasAvailabilitySet: false, hasProfileComplete,
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  const allBookings = await db
    .select({
      id: bookings.id,
      listingId: bookings.listingId,
      guestName: bookings.guestName,
      checkIn: bookings.checkIn,
      bookingDate: bookings.bookingDate,
      bookingTime: bookings.bookingTime,
      guests: bookings.guests,
      totalXaf: bookings.totalXaf,
      serviceFeeXaf: bookings.serviceFeeXaf,
      status: bookings.status,
      paymentMethod: bookings.paymentMethod,
      paymentStatus: bookings.paymentStatus,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(
      sql`${bookings.listingId} = ANY(ARRAY[${sql.join(
        listingIds.map((id) => sql`${id}::uuid`),
        sql`, `
      )}])`
    )
    .orderBy(sql`${bookings.createdAt} DESC`)
    .limit(200)

  // ── Stats ─────────────────────────────────────────────────────────────────

  const todayBookings = allBookings.filter(
    (b) => b.checkIn === today || b.bookingDate === today
  ).length

  const pendingBookings = allBookings.filter((b) => b.status === 'pending').length

  // Net of Reserve237's service fee — the actual amount the business earns
  const totalRevenueXaf = allBookings
    .filter((b) => b.paymentStatus === 'paid' || b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalXaf - b.serviceFeeXaf), 0)

  const listingNameMap = Object.fromEntries(
    partnerListings.map((l) => [l.id, l.name])
  )

  const recentBookings: RecentBooking[] = allBookings.slice(0, 8).map((b) => ({
    id: b.id,
    guestName: b.guestName,
    listingName: listingNameMap[b.listingId] ?? 'Unknown listing',
    checkIn: b.checkIn,
    bookingDate: b.bookingDate,
    bookingTime: b.bookingTime,
    guests: b.guests,
    totalXaf: b.totalXaf,
    status: b.status,
    paymentMethod: b.paymentMethod,
    createdAt: b.createdAt,
  }))

  // ── Weekly chart data (last 7 days by booking creation date) ─────────────

  // Build map: YYYY-MM-DD → { bookings, revenue }
  const dayMap = new Map<string, { bookings: number; revenueXaf: number }>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dayMap.set(d.toISOString().slice(0, 10), { bookings: 0, revenueXaf: 0 })
  }

  for (const b of allBookings) {
    const key = b.createdAt.toISOString().slice(0, 10)
    const entry = dayMap.get(key)
    if (entry) {
      entry.bookings++
      if (b.status === 'confirmed' || b.status === 'completed' || b.paymentStatus === 'paid') {
        entry.revenueXaf += b.totalXaf - b.serviceFeeXaf
      }
    }
  }

  const maxBookings = Math.max(...Array.from(dayMap.values()).map((v) => v.bookings), 1)

  const weeklyData: WeekDay[] = Array.from(dayMap.entries()).map(([date, data]) => {
    // Use noon UTC to avoid day-boundary timezone issues
    const d = new Date(`${date}T12:00:00Z`)
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      bookings: data.bookings,
      revenueXaf: data.revenueXaf,
      h: Math.round((data.bookings / maxBookings) * 100),
    }
  })

  // Onboarding checklist flags — batched queries
  const [photoCheck, availCheck] = await Promise.all([
    db
      .select({ id: listingImages.id })
      .from(listingImages)
      .where(inArray(listingImages.listingId, listingIds))
      .limit(1),
    db
      .select({ id: availability.id })
      .from(availability)
      .where(inArray(availability.listingId, listingIds))
      .limit(1),
  ])

  return {
    totalListings,
    activeListings,
    todayBookings,
    pendingBookings,
    totalRevenueXaf,
    recentBookings,
    weeklyData,
    hasPhotos: photoCheck.length > 0,
    hasAvailabilitySet: availCheck.length > 0,
    hasProfileComplete,
  }
}

// ─── Pending bookings summary (sidebar badge + topbar dropdown) ────────────────

export interface PendingBookingSummary {
  id: string
  guestName: string
  listingName: string
  checkIn: string | null
  bookingDate: string | null
  bookingTime: string | null
  totalXaf: number
  createdAt: Date
}

export interface PendingBookingsResult {
  count: number
  items: PendingBookingSummary[]
}

export async function getPendingBookingsSummary(userId: string): Promise<PendingBookingsResult> {
  const [business] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerId, userId))
    .limit(1)

  if (!business) return { count: 0, items: [] }

  const partnerListings = await db
    .select({ id: listings.id, name: listings.name })
    .from(listings)
    .where(eq(listings.businessId, business.id))

  const listingIds = partnerListings.map((l) => l.id)
  if (listingIds.length === 0) return { count: 0, items: [] }

  const listingNameMap = Object.fromEntries(partnerListings.map((l) => [l.id, l.name]))

  const pending = await db
    .select({
      id: bookings.id,
      listingId: bookings.listingId,
      guestName: bookings.guestName,
      checkIn: bookings.checkIn,
      bookingDate: bookings.bookingDate,
      bookingTime: bookings.bookingTime,
      totalXaf: bookings.totalXaf,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(
      and(
        sql`${bookings.listingId} = ANY(ARRAY[${sql.join(
          listingIds.map((id) => sql`${id}::uuid`),
          sql`, `
        )}])`,
        eq(bookings.status, 'pending')
      )
    )
    .orderBy(sql`${bookings.createdAt} DESC`)

  return {
    count: pending.length,
    items: pending.slice(0, 5).map((b) => ({
      id: b.id,
      guestName: b.guestName,
      listingName: listingNameMap[b.listingId] ?? 'Unknown listing',
      checkIn: b.checkIn,
      bookingDate: b.bookingDate,
      bookingTime: b.bookingTime,
      totalXaf: b.totalXaf,
      createdAt: b.createdAt,
    })),
  }
}
