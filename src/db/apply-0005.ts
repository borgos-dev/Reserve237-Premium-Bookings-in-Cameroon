// Applies migration 0005_booking_cancellation.sql directly (db:push is broken
// in this sandbox — same approach as 0002/0003/0004). Run: npx tsx src/db/apply-0005.ts
import 'dotenv/config'
import * as dotenv from 'dotenv'
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  const sql = postgres(connectionString, { prepare: false })
  const migration = readFileSync(
    join(__dirname, 'migrations', '0005_booking_cancellation.sql'),
    'utf8'
  )

  await sql.unsafe(migration)

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'bookings'
      AND column_name IN ('cancelled_at', 'cancelled_by', 'cancellation_reason')
  `
  console.log(`✅ Migration 0005 applied. Columns present: ${cols.length}/3`)

  await sql.end()
}

main().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
