import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Connection options for Supabase transaction pooler (port 6543):
// - prepare: false   — required, transaction pooler doesn't support prepared statements
// - idle_timeout: 10 — proactively close idle connections before Supabase resets them (prevents ECONNRESET)
// - max_lifetime: 300 — recycle connections every 5 minutes max
// - connect_timeout: 30 — wait up to 30s when establishing a connection
const client = postgres(connectionString, {
  prepare: false,
  idle_timeout: 10,
  max_lifetime: 300,
  connect_timeout: 30,
})

export const db = drizzle(client, { schema })
