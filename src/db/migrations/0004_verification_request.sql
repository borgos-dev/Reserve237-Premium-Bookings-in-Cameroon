-- Partners can request the "Verified partner" badge from the dashboard;
-- the team follows up manually and approves via src/db/approve-verification.ts.
-- Applied directly via script on 2026-08-05 (same pattern as 0002/0003).
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "verification_requested_at" timestamp;
