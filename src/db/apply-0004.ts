// Applies migration 0004_verification_request.sql directly (db:push is broken
// in this sandbox — same approach as 0002/0003). Run: npx tsx src/db/apply-0004.ts
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
    join(__dirname, 'migrations', '0004_verification_request.sql'),
    'utf8'
  )

  await sql.unsafe(migration)

  const cols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'verification_requested_at'
  `
  console.log(`✅ Migration 0004 applied. Column present: ${cols.length === 1}`)

  await sql.end()
}

main().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
