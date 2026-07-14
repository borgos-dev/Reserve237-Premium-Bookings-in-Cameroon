'use server'

import { db } from '@/db'
import { listings, businesses, listingVideos } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { supabaseAdmin } from '@/lib/supabase'
import { VIDEO_LIMITS, MAX_VIDEO_FILE_SIZE_MB } from '@/lib/videoLimits'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storagePathFromVideoUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/listing-videos/'
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

async function uploadVideoToStorage(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'mp4'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  const { data, error } = await supabaseAdmin.storage
    .from('listing-videos')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[uploadVideoToStorage]', error.message)
    return null
  }

  return supabaseAdmin.storage.from('listing-videos').getPublicUrl(data.path).data.publicUrl
}

// ─── Read ──────────────────────────────────────────────────────────────────────

export interface ListingVideoSummary {
  id: string
  url: string
  posterUrl: string | null
  durationSeconds: number
}

export async function getListingVideos(listingId: string): Promise<ListingVideoSummary[]> {
  return db
    .select({
      id: listingVideos.id,
      url: listingVideos.url,
      posterUrl: listingVideos.posterUrl,
      durationSeconds: listingVideos.durationSeconds,
    })
    .from(listingVideos)
    .where(eq(listingVideos.listingId, listingId))
    .orderBy(listingVideos.order)
}

// ─── Upload ────────────────────────────────────────────────────────────────────

export type UploadVideoResult =
  | { success: true; video: ListingVideoSummary }
  | { success: false; error: string }

export async function uploadListingVideo(
  listingId: string,
  userId: string,
  durationSeconds: number,
  videoFile: FormData
): Promise<UploadVideoResult> {
  try {
    const [row] = await db
      .select({ slug: listings.slug, plan: businesses.plan })
      .from(listings)
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(and(eq(listings.id, listingId), eq(businesses.ownerId, userId)))
      .limit(1)

    if (!row) return { success: false, error: 'Listing not found.' }

    const limits = VIDEO_LIMITS[row.plan]

    const existing = await db
      .select({ id: listingVideos.id })
      .from(listingVideos)
      .where(eq(listingVideos.listingId, listingId))

    if (existing.length >= limits.maxVideos) {
      return {
        success: false,
        error: `Your plan allows up to ${limits.maxVideos} video${limits.maxVideos > 1 ? 's' : ''} per listing.`,
      }
    }

    if (durationSeconds > limits.maxDurationSeconds) {
      return {
        success: false,
        error: `Videos must be ${limits.maxDurationSeconds} seconds or shorter on your plan.`,
      }
    }

    const file = videoFile.get('video') as File | null
    if (!file) return { success: false, error: 'No video file provided.' }

    if (file.size > MAX_VIDEO_FILE_SIZE_MB * 1024 * 1024) {
      return { success: false, error: `Video must be under ${MAX_VIDEO_FILE_SIZE_MB}MB.` }
    }

    const url = await uploadVideoToStorage(file, row.slug)
    if (!url) return { success: false, error: 'Failed to upload video. Please try again.' }

    // Optional poster frame captured client-side; the video still saves without one.
    let posterUrl: string | null = null
    const poster = videoFile.get('poster') as File | null
    if (poster && poster.size > 0) {
      posterUrl = await uploadVideoToStorage(poster, `${row.slug}/posters`)
    }

    const [video] = await db
      .insert(listingVideos)
      .values({
        listingId,
        url,
        posterUrl,
        durationSeconds: Math.round(durationSeconds),
        order: existing.length,
      })
      .returning({
        id: listingVideos.id,
        url: listingVideos.url,
        posterUrl: listingVideos.posterUrl,
        durationSeconds: listingVideos.durationSeconds,
      })

    return { success: true, video }
  } catch (err) {
    console.error('[uploadListingVideo]', err)
    return { success: false, error: 'Failed to upload video. Please try again.' }
  }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteListingVideo(
  videoId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [row] = await db
      .select({ id: listingVideos.id, url: listingVideos.url, posterUrl: listingVideos.posterUrl })
      .from(listingVideos)
      .innerJoin(listings, eq(listingVideos.listingId, listings.id))
      .innerJoin(businesses, eq(listings.businessId, businesses.id))
      .where(and(eq(listingVideos.id, videoId), eq(businesses.ownerId, userId)))
      .limit(1)

    if (!row) return { success: false, error: 'Video not found.' }

    const paths = [row.url, row.posterUrl]
      .map((u) => (u ? storagePathFromVideoUrl(u) : null))
      .filter((p): p is string => p !== null)
    if (paths.length > 0) {
      const { error } = await supabaseAdmin.storage.from('listing-videos').remove(paths)
      if (error) console.error('[deleteListingVideo:storage]', error.message)
    }

    await db.delete(listingVideos).where(eq(listingVideos.id, videoId))
    return { success: true }
  } catch (err) {
    console.error('[deleteListingVideo]', err)
    return { success: false, error: 'Failed to delete video.' }
  }
}
