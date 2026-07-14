import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { listings } from './listings'
import { bookings } from './bookings'

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id')
    .references(() => listings.id, { onDelete: 'cascade' })
    .notNull(),
  // Linked to a booking — ensures reviews are from real guests
  bookingId: uuid('booking_id').references(() => bookings.id),
  userId: text('user_id'), // Clerk user ID
  authorName: text('author_name').notNull(),
  rating: integer('rating').notNull(), // 1–5
  body: text('body'),
  // Business owner can reply once
  reply: text('reply'),
  repliedAt: timestamp('replied_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert
