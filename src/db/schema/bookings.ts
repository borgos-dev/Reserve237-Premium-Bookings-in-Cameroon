import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
} from 'drizzle-orm/pg-core'
import { listings } from './listings'

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id')
    .references(() => listings.id)
    .notNull(),
  // Clerk user ID — null for guest (non-authenticated) bookings
  userId: text('user_id'),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestPhone: text('guest_phone').notNull(),
  // Date range (accommodation, car hire)
  checkIn: date('check_in'),
  checkOut: date('check_out'),
  // Single date + time (restaurants, salons, events)
  bookingDate: date('booking_date'),
  bookingTime: text('booking_time'), // "19:00"
  guests: integer('guests').default(1).notNull(),
  // All monetary values in XAF (no decimals)
  totalXaf: integer('total_xaf').notNull(),
  serviceFeeXaf: integer('service_fee_xaf').default(0).notNull(),
  paymentMethod: text('payment_method', {
    enum: ['mtn-momo', 'orange-money', 'card', 'cash'],
  }).notNull(),
  paymentStatus: text('payment_status', {
    enum: ['pending', 'paid', 'failed', 'refunded'],
  })
    .default('pending')
    .notNull(),
  campayRef: text('campay_ref'), // Campay transaction reference (set after MoMo payment)
  status: text('status', {
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
  })
    .default('pending')
    .notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
