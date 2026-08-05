-- Diaspora gifting: someone abroad books & pays for a beneficiary in Cameroon.
-- When is_gift: guest_* columns hold the BENEFICIARY, booker_* hold the PAYER.
-- Applied directly via script on 2026-08-05 (same pattern as 0002).
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "is_gift" boolean DEFAULT false NOT NULL;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "booker_name" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "booker_email" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "booker_phone" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "gift_message" text;
