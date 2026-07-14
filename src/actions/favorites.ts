'use server'

import { db } from '@/db'
import { favorites } from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'

// Get all listing IDs a user has favourited
export async function getUserFavoriteIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ listingId: favorites.listingId })
    .from(favorites)
    .where(eq(favorites.userId, userId))
  return rows.map((r) => r.listingId)
}

// Add a single favourite to DB (idempotent)
export async function addFavoriteDB(
  userId: string,
  listingId: string
): Promise<void> {
  await db
    .insert(favorites)
    .values({ userId, listingId })
    .onConflictDoNothing()
}

// Remove a single favourite from DB
export async function removeFavoriteDB(
  userId: string,
  listingId: string
): Promise<void> {
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)))
}

// Replace all DB favourites for a user in one shot (used on first sync)
export async function syncFavoritesToDB(
  userId: string,
  listingIds: string[]
): Promise<void> {
  if (listingIds.length === 0) return
  await db
    .insert(favorites)
    .values(listingIds.map((listingId) => ({ userId, listingId })))
    .onConflictDoNothing()
}
