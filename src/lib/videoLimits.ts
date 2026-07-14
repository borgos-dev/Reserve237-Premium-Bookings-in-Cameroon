// ─── Video tier limits ──────────────────────────────────────────────────────
// How many videos a business can attach per listing, and the max length of
// each, based on their subscription plan.

export interface VideoLimit {
  maxVideos: number
  maxDurationSeconds: number
}

export const VIDEO_LIMITS: Record<'free' | 'basic' | 'premium', VideoLimit> = {
  free: { maxVideos: 1, maxDurationSeconds: 30 },
  basic: { maxVideos: 3, maxDurationSeconds: 60 },
  premium: { maxVideos: 6, maxDurationSeconds: 120 },
}

export const MAX_VIDEO_FILE_SIZE_MB = 50
