import { pgTable, uuid, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'
import { listings } from './listings'

export const listingImages = pgTable('listing_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id')
    .references(() => listings.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  alt: text('alt'),
  order: integer('order').default(0).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type ListingImage = typeof listingImages.$inferSelect
export type NewListingImage = typeof listingImages.$inferInsert
