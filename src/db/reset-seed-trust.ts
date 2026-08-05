// One-off maintenance: strip fake trust signals from seeded demo listings.
// Seeded rows (business_id IS NULL) carried hardcoded ratings/review counts
// and a verified badge from the mock data — real listings earn those instead.
// Run with: npx tsx src/db/reset-seed-trust.ts
import 'dotenv/config'
import * as dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config({ path: '.env.local' })

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  const sql = postgres(connectionString, { prepare: false })

  const rows = await sql`
    UPDATE listings
    SET rating = '0', review_count = 0, verified = false
    WHERE business_id IS NULL
      AND (rating != '0' OR review_count != 0 OR verified = true)
    RETURNING name
  `

  console.log(`✅ Reset trust signals on ${rows.length} seeded listing(s):`)
  for (const r of rows) console.log(`  · ${r.name}`)

  await sql.end()
}

main().catch((err) => {
  console.error('❌ Reset failed:', err)
  process.exit(1)
})
