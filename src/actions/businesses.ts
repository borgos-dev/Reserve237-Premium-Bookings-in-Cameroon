'use server'

import { db } from '@/db'
import { businesses, users, listings, SUB_CATEGORIES, type MainCategory } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'
import { uniqueSlug } from './listings'

// ─── Get or auto-create a business for a partner ──────────────────────────────

export async function getOrCreateBusiness(userId: string) {
  const [existing] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId))
    .limit(1)

  if (existing) return existing

  const user = await currentUser()
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName ?? 'My Business'

  const [created] = await db
    .insert(businesses)
    .values({
      ownerId: userId,
      name: `${displayName}'s Business`,
      email: user?.emailAddresses[0]?.emailAddress ?? null,
      plan: 'free',
      verified: false,
    })
    .returning()

  return created
}

// ─── Called immediately after email verification on sign-up ───────────────────
// Saves all collected sign-up info to the DB in one shot.

export interface BusinessProfileInput {
  userId: string
  email: string
  name: string
  mainCategory: string
  subType?: string
  city: string
  neighborhood: string
  landmark: string
  description?: string
  phone?: string
  whatsapp?: string
}

export async function setupBusinessProfile(
  input: BusinessProfileInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Upsert the user record first (required by businesses FK constraint)
    await db
      .insert(users)
      .values({
        id: input.userId,
        email: input.email,
        role: 'partner',
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          role: 'partner',
          email: input.email,
          updatedAt: new Date(),
        },
      })

    // Check if a business already exists (e.g. from a previous attempt)
    const [existing] = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.ownerId, input.userId))
      .limit(1)

    if (existing) return { success: true }

    // Create the business record with all sign-up data
    const [business] = await db
      .insert(businesses)
      .values({
        ownerId: input.userId,
        name: input.name,
        email: input.email,
        mainCategory: input.mainCategory,
        city: input.city,
        neighborhood: input.neighborhood,
        landmark: input.landmark,
        description: input.description ?? null,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        plan: 'free',
        verified: false,
      })
      .returning({ id: businesses.id })

    // Pre-fill their first listing from the sign-up wizard so the dashboard
    // isn't empty on first login — they just need to add photos and a price.
    const subCategory =
      input.subType || SUB_CATEGORIES[input.mainCategory as MainCategory]?.[0] || 'other'

    await db.insert(listings).values({
      businessId: business.id,
      name: input.name,
      slug: await uniqueSlug(input.name),
      mainCategory: input.mainCategory,
      subCategory,
      description: input.description ?? null,
      city: input.city,
      neighborhood: input.neighborhood || null,
      address: input.landmark || null,
      phone: input.phone ?? null,
      whatsapp: input.whatsapp ?? null,
      active: true,
    })

    return { success: true }
  } catch (err) {
    console.error('[setupBusinessProfile]', err)
    return { success: false, error: 'Failed to save business profile. Please contact support.' }
  }
}

// ─── Update business profile (used in Settings page) ─────────────────────────

export interface UpdateBusinessInput {
  userId: string
  name: string
  description?: string
  city?: string
  neighborhood?: string
  landmark?: string
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  youtube?: string
  twitter?: string
}

export async function updateBusinessProfile(
  input: UpdateBusinessInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.ownerId, input.userId))
      .limit(1)

    if (!existing) return { success: false, error: 'Business not found.' }

    await db
      .update(businesses)
      .set({
        name: input.name,
        description: input.description ?? null,
        city: input.city ?? null,
        neighborhood: input.neighborhood ?? null,
        landmark: input.landmark ?? null,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        email: input.email ?? null,
        website: input.website ?? null,
        instagram: input.instagram ?? null,
        facebook: input.facebook ?? null,
        tiktok: input.tiktok ?? null,
        youtube: input.youtube ?? null,
        twitter: input.twitter ?? null,
        updatedAt: new Date(),
      })
      .where(eq(businesses.ownerId, input.userId))

    return { success: true }
  } catch (err) {
    console.error('[updateBusinessProfile]', err)
    return { success: false, error: 'Failed to update profile.' }
  }
}

// ─── Get business profile ─────────────────────────────────────────────────────

export async function getBusinessProfile(userId: string) {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId))
    .limit(1)

  return business ?? null
}
