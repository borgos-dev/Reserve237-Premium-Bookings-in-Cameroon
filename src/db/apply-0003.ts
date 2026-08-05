// Applies migration 0003_diaspora_gifting.sql directly (db:push is broken in
// this sandbox — same approach used for 0002). Run: npx tsx src/db/apply-0003.ts
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
    join(__dirname, 'migrations', '0003_diaspora_gifting.sql'),
    'utf8'
  )

  await sql.unsafe(migration)

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'bookings'
      AND column_name IN ('is_gift', 'booker_name', 'booker_email', 'booker_phone', 'gift_message')
    ORDER BY column_name
  `
  console.log('✅ Migration 0003 applied. New booking columns:')
  for (const c of cols) console.log(`  · ${c.column_name}`)

  await sql.end()
}

main().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
