-- Records WHO cancelled a booking and WHY, so the notification sent to the
-- other party can name the right party and the reason, instead of a bare
-- status flip that leaves everyone guessing.
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelled_by" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancellation_reason" text;
