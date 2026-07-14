-- Adds poster (thumbnail) support to listing videos.
-- Applied directly via script on 2026-07-14 (db:push is broken in this sandbox).
ALTER TABLE "listing_videos" ADD COLUMN IF NOT EXISTS "poster_url" text;
