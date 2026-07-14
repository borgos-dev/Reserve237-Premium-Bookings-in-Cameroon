import { pgTable, uuid, text, boolean, timestamp, date } from 'drizzle-orm/pg-core'
import { listings } from './listings'

export const availability = pgTable('availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id')
    .references(() => listings.id, { onDelete: 'cascade' })
    .notNull(),
  date: date('date').notNull(),
  isBlocked: boolean('is_blocked').default(true).notNull(),
  reason: text('reason'), // "Booked", "Maintenance", "Private event"
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Availability = typeof availability.$inferSelect
export type NewAvailability = typeof availability.$inferInsert
