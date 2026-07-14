import { pgTable, uuid, text } from 'drizzle-orm/pg-core'
import { listings } from './listings'

export const listingAmenities = pgTable('listing_amenities', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id')
    .references(() => listings.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
})

export type ListingAmenity = typeof listingAmenities.$inferSelect
export type NewListingAmenity = typeof listingAmenities.$inferInsert
