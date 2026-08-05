'use server'

import { db } from '@/db'
import { businesses, users, listings, SUB_CATEGORIES, type MainCategory } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'
import { uniqueSlug } from './listings'
import { sendTeamNotification } from '@/lib/email'

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

  // Ensure the users row exists first (businesses.owner_id FK requires it).
  // Heals accounts whose DB rows were lost (e.g. after a database restore)
  // while their Clerk login still exists.
  await db
    .insert(users)
    .values({
      id: userId,
      email: user?.emailAddresses[0]?.emailAddress ?? '',
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
      role: 'partner',
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { role: 'partner', updatedAt: new Date() },
    })

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

// ─── Request the "Verified partner" badge ─────────────────────────────────────
// Partners can't grant themselves the badge — this only records the request and
// alerts the team, who verify in person and approve via src/db/approve-verification.ts.

export async function requestVerification(
  userId: string
): Promise<{ success: boolean; requestedAt?: string; error?: string }> {
  try {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, userId))
      .limit(1)

    if (!business) return { success: false, error: 'Business not found.' }
    if (business.verified) return { success: false, error: 'Already verified.' }

    // Re-sending refreshes the timestamp so the team sees the latest nudge.
    const requestedAt = new Date()
    await db
      .update(businesses)
      .set({ verificationRequestedAt: requestedAt, updatedAt: requestedAt })
      .where(eq(businesses.ownerId, userId))

    const [listingCount] = await db
      .select({ id: listings.id })
      .from(listings)
      .where(eq(listings.businessId, business.id))
      .limit(1)

    await sendTeamNotification({
      name: business.name,
      email: business.email ?? '',
      phone: business.phone ?? business.whatsapp,
      subject: `Verification request — ${business.name}`,
      message: [
        `Business: ${business.name}`,
        `Category: ${business.mainCategory ?? '—'}`,
        `Location: ${[business.neighborhood, business.city].filter(Boolean).join(', ') || '—'}`,
        `Landmark: ${business.landmark ?? '—'}`,
        `Phone: ${business.phone ?? '—'}  ·  WhatsApp: ${business.whatsapp ?? '—'}`,
        `Email: ${business.email ?? '—'}`,
        `Has listings: ${listingCount ? 'yes' : 'no'}`,
        `Business ID: ${business.id}`,
        '',
        'Approve with: npx tsx src/db/approve-verification.ts <business-id>',
      ].join('\n'),
    })

    return { success: true, requestedAt: requestedAt.toISOString() }
  } catch (err) {
    console.error('[requestVerification]', err)
    return { success: false, error: 'Failed to send the request.' }
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
