import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { listings } from './listings'

export const listingVideos = pgTable('listing_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id')
    .references(() => listings.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  posterUrl: text('poster_url'),
  durationSeconds: integer('duration_seconds').notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type ListingVideo = typeof listingVideos.$inferSelect
export type NewListingVideo = typeof listingVideos.$inferInsert
