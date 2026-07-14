import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  // Location
  mainCategory: text('main_category'),
  city: text('city'),
  neighborhood: text('neighborhood'),
  landmark: text('landmark'),            // e.g. "En face Total Bonapriso"
  // Contact
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  email: text('email'),
  // Online presence
  website: text('website'),
  instagram: text('instagram'),
  facebook: text('facebook'),
  tiktok: text('tiktok'),
  youtube: text('youtube'),
  twitter: text('twitter'),
  // Status
  verified: boolean('verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  plan: text('plan', { enum: ['free', 'basic', 'premium'] })
    .default('free')
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Business = typeof businesses.$inferSelect
export type NewBusiness = typeof businesses.$inferInsert
