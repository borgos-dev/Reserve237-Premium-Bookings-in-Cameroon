// Grants the "Verified partner" badge after the team has physically verified a
// business. Verification is deliberately manual — the badge is the platform's
// own promise, so it can never be self-granted from the dashboard.
//
//   npx tsx src/db/approve-verification.ts            → list pending requests
//   npx tsx src/db/approve-verification.ts <id>       → approve that business
//   npx tsx src/db/approve-verification.ts <id> --revoke
import 'dotenv/config'
import * as dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config({ path: '.env.local' })

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  const sql = postgres(connectionString, { prepare: false })
  const businessId = process.argv[2]
  const revoke = process.argv.includes('--revoke')

  if (!businessId) {
    const pending = await sql`
      SELECT id, name, city, neighborhood, phone, whatsapp, email,
             verification_requested_at
      FROM businesses
      WHERE verified = false AND verification_requested_at IS NOT NULL
      ORDER BY verification_requested_at ASC`

    if (pending.length === 0) {
      console.log('No pending verification requests.')
    } else {
      console.log(`${pending.length} pending verification request(s):\n`)
      for (const b of pending) {
        const where = [b.neighborhood, b.city].filter(Boolean).join(', ') || '—'
        const asked = new Date(b.verification_requested_at).toISOString().slice(0, 10)
        console.log(`  ${b.id}`)
        console.log(`    ${b.name} · ${where}`)
        console.log(`    ${b.phone ?? b.whatsapp ?? '—'} · ${b.email ?? '—'} · asked ${asked}\n`)
      }
      console.log('Approve with: npx tsx src/db/approve-verification.ts <id>')
    }
    await sql.end()
    return
  }

  // The badge lives on the business AND on each of its listings (listings are
  // what customers actually see), so both are kept in sync here.
  const [business] = await sql`
    UPDATE businesses
    SET verified = ${!revoke},
        verified_at = ${revoke ? null : sql`now()`},
        updated_at = now()
    WHERE id = ${businessId}
    RETURNING id, name`

  if (!business) {
    console.error(`❌ No business with id ${businessId}`)
    process.exit(1)
  }

  const updated = await sql`
    UPDATE listings SET verified = ${!revoke}, updated_at = now()
    WHERE business_id = ${businessId}
    RETURNING name`

  const verb = revoke ? 'Revoked' : 'Verified'
  console.log(`✅ ${verb}: ${business.name} (${updated.length} listing(s) updated)`)

  await sql.end()
}

main().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})
