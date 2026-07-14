'use server'

import { db } from '@/db'
import { users, businesses, listings, bookings } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

// Deletes all partner data from the DB in the correct order to avoid FK violations.
// The Clerk user deletion is handled client-side via user.delete() after this succeeds.
export async function deleteBusinessAccount(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [business] = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.ownerId, userId))
      .limit(1)

    if (business) {
      const partnerListings = await db
        .select({ id: listings.id })
        .from(listings)
        .where(eq(listings.businessId, business.id))

      if (partnerListings.length > 0) {
        const ids = partnerListings.map((l) => l.id)

        // bookings have no cascade — delete first
        await db.delete(bookings).where(inArray(bookings.listingId, ids))

        // listings deletion cascades: images, amenities, reviews, favorites, availability
        await db.delete(listings).where(eq(listings.businessId, business.id))
      }

      await db.delete(businesses).where(eq(businesses.id, business.id))
    }

    // Remove user record last (FK referenced by businesses)
    await db.delete(users).where(eq(users.id, userId))

    return { success: true }
  } catch (err) {
    console.error('[deleteBusinessAccount]', err)
    return { success: false, error: 'Failed to delete account. Please contact support.' }
  }
}
