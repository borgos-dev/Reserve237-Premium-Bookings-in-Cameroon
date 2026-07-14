'use server'

import { db } from '@/db'
import { listings, listingImages, listingAmenities, listingVideos, businesses } from '@/db/schema'
import { eq, and, ilike, or, inArray } from 'drizzle-orm'
import { supabaseAdmin } from '@/lib/supabase'
import { getOrCreateBusiness } from './businesses'
import type { PublicListing } from '@/types/listing'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Slugs are unique in the DB — two listings named "Chez Mama" must not collide.
// Appends -2, -3, … when the base slug is already taken.
export async function uniqueSlug(name: string): Promise<string> {
  const base = generateSlug(name) || 'listing'
  const taken = await db
    .select({ slug: listings.slug })
    .from(listings)
    .where(or(eq(listings.slug, base), ilike(listings.slug, `${base}-%`)))
  const takenSet = new Set(taken.map((t) => t.slug))
  if (!takenSet.has(base)) return base
  let n = 2
  while (takenSet.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

function storagePathFromUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/listings/'
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

async function removeImagesFromStorage(urls: string[]): Promise<void> {
  const paths = urls.map(storagePathFromUrl).filter(Boolean) as string[]
  if (paths.length === 0) return
  const { error } = await supabaseAdmin.storage.from('listings').remove(paths)
  if (error) console.error('[removeImagesFromStorage]', error.message)
}

function capacityFromDetails(details: unknown): number | null {
  const c = (details as { capacity?: unknown } | null)?.capacity
  return typeof c === 'number' && c > 0 ? c : null
}

async function uploadImageToStorage(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  const { data, error } = await supabaseAdmin.storage
    .from('listings')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[uploadImageToStorage]', error.message)
    return null
  }

  return supabaseAdmin.storage.from('listings').getPublicUrl(data.path).data.publicUrl
}

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getListingBySlug(slug: string) {
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.slug, slug))
    .limit(1)

  if (!listing) return null

  const [images, amenities] = await Promise.all([
    db.select().from(listingImages).where(eq(listingImages.listingId, listing.id)).orderBy(listingImages.order),
    db.select().from(listingAmenities).where(eq(listingAmenities.listingId, listing.id)),
  ])

  return { ...listing, images, amenities: amenities.map((a) => a.name) }
}

export async function getListings(filters?: {
  category?: string
  city?: string
  search?: string
  featured?: boolean
}) {
  const conditions = [eq(listings.active, true)]

  if (filters?.category && filters.category !== 'all')
    conditions.push(eq(listings.mainCategory, filters.category))
  if (filters?.city)
    conditions.push(eq(listings.city, filters.city))
  if (filters?.search)
    conditions.push(
      or(
        ilike(listings.name, `%${filters.search}%`),
        ilike(listings.city, `%${filters.search}%`)
      )!
    )
  if (filters?.featured)
    conditions.push(eq(listings.featured, true))

  return db.select().from(listings).where(and(...conditions))
}

// ─── Customer-facing listings (with images + amenities, PublicListing shape) ──

export async function getPublicListings(filters?: {
  category?: string
  city?: string
  search?: string
  featured?: boolean
}): Promise<PublicListing[]> {
  const conditions = [eq(listings.active, true)]

  if (filters?.category && filters.category !== 'all')
    conditions.push(eq(listings.mainCategory, filters.category))
  if (filters?.city)
    conditions.push(eq(listings.city, filters.city))
  if (filters?.search) {
    const q = `%${filters.search}%`
    conditions.push(
      or(
        ilike(listings.name, q),
        ilike(listings.city, q),
        ilike(listings.neighborhood ?? listings.city, q)
      )!
    )
  }
  if (filters?.featured) conditions.push(eq(listings.featured, true))

  const rows = await db
    .select()
    .from(listings)
    .where(and(...conditions))
    .orderBy(listings.createdAt)

  if (rows.length === 0) return []

  const ids = rows.map((r) => r.id)

  // Fetch primary images and amenities in two batched queries
  const [images, amenities] = await Promise.all([
    db
      .select({ listingId: listingImages.listingId, url: listingImages.url })
      .from(listingImages)
      .where(and(inArray(listingImages.listingId, ids), eq(listingImages.isPrimary, true))),
    db
      .select({ listingId: listingAmenities.listingId, name: listingAmenities.name })
      .from(listingAmenities)
      .where(inArray(listingAmenities.listingId, ids)),
  ])

  const imageMap = Object.fromEntries(images.map((i) => [i.listingId, i.url]))
  const amenityMap: Record<string, string[]> = {}
  for (const a of amenities) {
    if (!amenityMap[a.listingId]) amenityMap[a.listingId] = []
    amenityMap[a.listingId].push(a.name)
  }

  // Fallback image for listings without an uploaded photo
  const FALLBACK = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'

  return rows.map((r): PublicListing => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    image: imageMap[r.id] ?? FALLBACK,
    mainCategory: r.mainCategory,
    subCategory: r.subCategory,
    location: [r.city, r.neighborhood].filter(Boolean).join(', '),
    city: r.city,
    neighborhood: r.neighborhood,
    address: r.address,
    phone: r.phone,
    whatsapp: r.whatsapp,
    rating: r.rating ? parseFloat(r.rating) : 0,
    reviewCount: r.reviewCount,
    priceMin: r.priceMin,
    priceLabel: r.priceLabel,
    priceRange: r.priceRange,
    verified: r.verified,
    featured: r.featured,
    amenities: amenityMap[r.id] ?? [],
    capacity: capacityFromDetails(r.details),
  }))
}

// ─── Get single public listing by slug ────────────────────────────────────────

export async function getPublicListingBySlug(slug: string): Promise<
  (PublicListing & {
    images: string[]
    description: string | null
    videos: { url: string; posterUrl: string | null; durationSeconds: number }[]
  }) | null
> {
  const [listing] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.slug, slug), eq(listings.active, true)))
    .limit(1)

  if (!listing) return null

  const [images, amenities, videos] = await Promise.all([
    db
      .select({ url: listingImages.url })
      .from(listingImages)
      .where(eq(listingImages.listingId, listing.id))
      .orderBy(listingImages.order),
    db
      .select({ name: listingAmenities.name })
      .from(listingAmenities)
      .where(eq(listingAmenities.listingId, listing.id)),
    db
      .select({ url: listingVideos.url, posterUrl: listingVideos.posterUrl, durationSeconds: listingVideos.durationSeconds })
      .from(listingVideos)
      .where(eq(listingVideos.listingId, listing.id))
      .orderBy(listingVideos.order),
  ])

  const FALLBACK = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'
  const imageUrls = images.map((i) => i.url)

  return {
    id: listing.id,
    name: listing.name,
    slug: listing.slug,
    image: imageUrls[0] ?? FALLBACK,
    images: imageUrls.length > 0 ? imageUrls : [FALLBACK],
    mainCategory: listing.mainCategory,
    subCategory: listing.subCategory,
    location: [listing.city, listing.neighborhood].filter(Boolean).join(', '),
    city: listing.city,
    neighborhood: listing.neighborhood,
    address: listing.address,
    phone: listing.phone,
    whatsapp: listing.whatsapp,
    rating: listing.rating ? parseFloat(listing.rating) : 0,
    reviewCount: listing.reviewCount,
    priceMin: listing.priceMin,
    priceLabel: listing.priceLabel,
    priceRange: listing.priceRange,
    verified: listing.verified,
    featured: listing.featured,
    amenities: amenities.map((a) => a.name),
    capacity: capacityFromDetails(listing.details),
    description: listing.description,
    videos,
  }
}

// ─── Get multiple listings by ID (used for loading DB favorites) ──────────────

export async function getListingsByIds(ids: string[]): Promise<PublicListing[]> {
  if (ids.length === 0) return []

  const rows = await db
    .select()
    .from(listings)
    .where(and(inArray(listings.id, ids), eq(listings.active, true)))

  if (rows.length === 0) return []

  const listingIds = rows.map((r) => r.id)
  const FALLBACK = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'

  const [images, amenities] = await Promise.all([
    db
      .select({ listingId: listingImages.listingId, url: listingImages.url })
      .from(listingImages)
      .where(and(inArray(listingImages.listingId, listingIds), eq(listingImages.isPrimary, true))),
    db
      .select({ listingId: listingAmenities.listingId, name: listingAmenities.name })
      .from(listingAmenities)
      .where(inArray(listingAmenities.listingId, listingIds)),
  ])

  const imageMap = Object.fromEntries(images.map((i) => [i.listingId, i.url]))
  const amenityMap: Record<string, string[]> = {}
  for (const a of amenities) {
    if (!amenityMap[a.listingId]) amenityMap[a.listingId] = []
    amenityMap[a.listingId].push(a.name)
  }

  return rows.map((r): PublicListing => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    image: imageMap[r.id] ?? FALLBACK,
    mainCategory: r.mainCategory,
    subCategory: r.subCategory,
    location: [r.city, r.neighborhood].filter(Boolean).join(', '),
    city: r.city,
    neighborhood: r.neighborhood,
    address: r.address,
    phone: r.phone,
    whatsapp: r.whatsapp,
    rating: r.rating ? parseFloat(r.rating) : 0,
    reviewCount: r.reviewCount,
    priceMin: r.priceMin,
    priceLabel: r.priceLabel,
    priceRange: r.priceRange,
    verified: r.verified,
    featured: r.featured,
    amenities: amenityMap[r.id] ?? [],
    capacity: capacityFromDetails(r.details),
  }))
}

export async function getPartnerListings(userId: string) {
  const rows = await db
    .select({
      id: listings.id,
      name: listings.name,
      slug: listings.slug,
      mainCategory: listings.mainCategory,
      subCategory: listings.subCategory,
      city: listings.city,
      neighborhood: listings.neighborhood,
      address: listings.address,
      phone: listings.phone,
      whatsapp: listings.whatsapp,
      priceMin: listings.priceMin,
      priceMax: listings.priceMax,
      priceLabel: listings.priceLabel,
      priceRange: listings.priceRange,
      description: listings.description,
      details: listings.details,
      rating: listings.rating,
      reviewCount: listings.reviewCount,
      verified: listings.verified,
      featured: listings.featured,
      active: listings.active,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .innerJoin(businesses, eq(listings.businessId, businesses.id))
    .where(eq(businesses.ownerId, userId))
    .orderBy(listings.createdAt)

  if (rows.length === 0) return []

  // Batch-fetch primary images for all listings in one query
  const ids = rows.map((r) => r.id)
  const primaryImages = await db
    .select({ listingId: listingImages.listingId, url: listingImages.url })
    .from(listingImages)
    .where(
      and(
        inArray(listingImages.listingId, ids),
        eq(listingImages.isPrimary, true)
      )
    )

  const imageMap = Object.fromEntries(primaryImages.map((i) => [i.listingId, i.url]))

  return rows.map((r) => ({
    ...r,
    image: imageMap[r.id] ?? null,  // null = no photo uploaded yet
    capacity: capacityFromDetails(r.details),
  }))
}

export async function getPartnerListingWithImages(listingId: string, userId: string) {
  const [listing] = await db
    .select()
    .from(listings)
    .innerJoin(businesses, eq(listings.businessId, businesses.id))
    .where(and(eq(listings.id, listingId), eq(businesses.ownerId, userId)))
    .limit(1)

  if (!listing) return null

  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.order)

  return { ...listing.listings, images }
}

// ─── Create ────────────────────────────────────────────────────────────────────

export interface CreateListingInput {
  userId: string
  name: string
  mainCategory: string
  subCategory: string
  city: string
  neighborhood?: string
  address?: string
  phone?: string
  whatsapp?: string
  priceMin?: number
  priceLabel?: string
  priceRange?: 'budget' | 'mid-range' | 'premium' | 'luxury'
  description?: string
  capacity?: number
}

export type ListingActionResult =
  | { success: true; listingId: string }
  | { success: false; error: string }

export async function createListing(
  input: CreateListingInput,
  imageFiles: FormData
): Promise<ListingActionResult> {
  try {
    const business = await getOrCreateBusiness(input.userId)
    const slug = await uniqueSlug(input.name)

    const [listing] = await db
      .insert(listings)
      .values({
        businessId: business.id,
        name: input.name,
        slug,
        mainCategory: input.mainCategory,
        subCategory: input.subCategory,
        city: input.city,
        neighborhood: input.neighborhood ?? null,
        address: input.address ?? null,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        priceMin: input.priceMin ?? null,
        priceLabel: input.priceLabel ?? null,
        priceRange: input.priceRange ?? null,
        description: input.description ?? null,
        details: input.capacity ? { capacity: input.capacity } : null,
        active: true,
        verified: false,
        featured: false,
      })
      .returning({ id: listings.id, slug: listings.slug })

    // Upload images
    const files = imageFiles.getAll('images') as File[]
    if (files.length > 0) {
      const urls = await Promise.all(
        files.map((f) => uploadImageToStorage(f, listing.slug))
      )
      const validUrls = urls.filter(Boolean) as string[]

      if (validUrls.length > 0) {
        await db.insert(listingImages).values(
          validUrls.map((url, i) => ({
            listingId: listing.id,
            url,
            alt: `${input.name} photo ${i + 1}`,
            order: i,
            isPrimary: i === 0,
          }))
        )
      }
    }

    return { success: true, listingId: listing.id }
  } catch (err) {
    console.error('[createListing]', err)
    return { success: false, error: 'Failed to create listing. Please try again.' }
  }
}

// ─── Update ────────────────────────────────────────────────────────────────────

export interface UpdateListingInput extends Omit<CreateListingInput, 'userId'> {
  listingId: string
  userId: string
  removeImageUrls?: string[]
}

export async function updateListing(
  input: UpdateListingInput,
  imageFiles: FormData
): Promise<ListingActionResult> {
  try {
    // Verify ownership
    const [existing] = await db
      .select({ id: listings.id })
      .from(listings)
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(and(eq(listings.id, input.listingId), eq(businesses.ownerId, input.userId)))
      .limit(1)

    if (!existing) return { success: false, error: 'Listing not found.' }

    await db
      .update(listings)
      .set({
        name: input.name,
        mainCategory: input.mainCategory,
        subCategory: input.subCategory,
        city: input.city,
        neighborhood: input.neighborhood ?? null,
        address: input.address ?? null,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        priceMin: input.priceMin ?? null,
        priceLabel: input.priceLabel ?? null,
        priceRange: input.priceRange ?? null,
        description: input.description ?? null,
        details: input.capacity ? { capacity: input.capacity } : null,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, input.listingId))

    // Remove specific photos the user deleted (per-photo, not destructive replace-all)
    if (input.removeImageUrls && input.removeImageUrls.length > 0) {
      await removeImagesFromStorage(input.removeImageUrls)
      await db
        .delete(listingImages)
        .where(
          and(
            eq(listingImages.listingId, input.listingId),
            inArray(listingImages.url, input.removeImageUrls)
          )
        )
    }

    // Append newly uploaded photos — existing ones are preserved
    const files = imageFiles.getAll('images') as File[]
    if (files.length > 0) {
      const urls = await Promise.all(
        files.map((f) => uploadImageToStorage(f, generateSlug(input.name)))
      )
      const validUrls = urls.filter(Boolean) as string[]

      if (validUrls.length > 0) {
        const remaining = await db
          .select({ order: listingImages.order, isPrimary: listingImages.isPrimary })
          .from(listingImages)
          .where(eq(listingImages.listingId, input.listingId))

        const hasPrimary = remaining.some((i) => i.isPrimary)
        const maxOrder = remaining.reduce((max, i) => Math.max(max, i.order), -1)

        await db.insert(listingImages).values(
          validUrls.map((url, i) => ({
            listingId: input.listingId,
            url,
            alt: `${input.name} photo`,
            order: maxOrder + 1 + i,
            isPrimary: !hasPrimary && i === 0,
          }))
        )
      }
    }

    return { success: true, listingId: input.listingId }
  } catch (err) {
    console.error('[updateListing]', err)
    return { success: false, error: 'Failed to update listing. Please try again.' }
  }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteListing(
  listingId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db
      .select({ id: listings.id })
      .from(listings)
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(and(eq(listings.id, listingId), eq(businesses.ownerId, userId)))
      .limit(1)

    if (!existing) return { success: false, error: 'Listing not found.' }

    await db.delete(listings).where(eq(listings.id, listingId))
    return { success: true }
  } catch (err) {
    console.error('[deleteListing]', err)
    return { success: false, error: 'Failed to delete listing.' }
  }
}

// ─── Toggle active ─────────────────────────────────────────────────────────────

export async function toggleListingActive(
  listingId: string,
  userId: string,
  active: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const [existing] = await db
      .select({ id: listings.id })
      .from(listings)
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(and(eq(listings.id, listingId), eq(businesses.ownerId, userId)))
      .limit(1)

    if (!existing) return { success: false, error: 'Listing not found.' }

    await db
      .update(listings)
      .set({ active, updatedAt: new Date() })
      .where(eq(listings.id, listingId))

    return { success: true }
  } catch (err) {
    console.error('[toggleListingActive]', err)
    return { success: false, error: 'Failed to update listing.' }
  }
}
