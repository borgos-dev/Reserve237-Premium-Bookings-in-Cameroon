import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core'
import { businesses } from './businesses'

// ─── Category constants ───────────────────────────────────────────────────────

export const MAIN_CATEGORIES = [
  'food-drinks',
  'nightlife',
  'beauty-wellness',
  'events-venues',
  'accommodation',
  'transport-more',
] as const

export type MainCategory = (typeof MAIN_CATEGORIES)[number]

export const SUB_CATEGORIES: Record<MainCategory, readonly string[]> = {
  'food-drinks': ['restaurant', 'snack-bar', 'cafe', 'bakery', 'fast-food'],
  nightlife: ['nightclub', 'lounge', 'bar', 'sports-bar', 'rooftop-bar'],
  'beauty-wellness': ['salon', 'spa', 'barbershop', 'nail-studio', 'massage-center'],
  'events-venues': ['wedding-hall', 'conference-room', 'stadium', 'theatre', 'outdoor-venue'],
  accommodation: ['hotel', 'guesthouse', 'villa', 'apartment', 'hostel'],
  'transport-more': ['car-hire', 'tour-operator', 'clinic', 'pharmacy', 'travel-agency'],
}

export const CITIES = [
  'Yaounde',
  'Douala',
  'Limbe',
  'Bafoussam',
  'Bamenda',
  'Kribi',
] as const

export type City = (typeof CITIES)[number]

// Neighborhoods by city — used for neighborhood-level filtering
export const NEIGHBORHOODS: Record<City, readonly string[]> = {
  Yaounde: ['Bastos', 'Mvan', 'Omnisports', 'Nlongkak', 'Centre Ville', 'Mvog-Mbi', 'Biyem-Assi', 'Nsimeyong'],
  Douala: ['Akwa', 'Bonanjo', 'Makepe', 'Bonapriso', 'Deido', 'Logpom', 'Bali', 'Ndogbong'],
  Limbe: ['Down Beach', 'Mile 4', 'Bota', 'GRA'],
  Bafoussam: ['Kamkop', 'Centre', 'Tamdja'],
  Bamenda: ['Commercial Avenue', 'Up Station', 'Nkwen'],
  Kribi: ['Centre Ville', 'Grand Batanga'],
}

// ─── Table ─────────────────────────────────────────────────────────────────────

export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  mainCategory: text('main_category').notNull(),
  subCategory: text('sub_category').notNull(),
  description: text('description'),
  city: text('city').notNull(),
  neighborhood: text('neighborhood'),
  address: text('address'),
  lat: numeric('lat', { precision: 10, scale: 7 }),
  lng: numeric('lng', { precision: 10, scale: 7 }),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  email: text('email'),
  // Price stored in XAF (integer, no decimals)
  priceMin: integer('price_min'),
  priceMax: integer('price_max'),
  priceLabel: text('price_label'),        // "From 35,000 XAF/night"
  priceRange: text('price_range', {
    enum: ['budget', 'mid-range', 'premium', 'luxury'],
  }),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0).notNull(),
  verified: boolean('verified').default(false).notNull(),
  featured: boolean('featured').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  // JSONB for category-specific details (avoids 6 join tables)
  details: jsonb('details').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Listing = typeof listings.$inferSelect
export type NewListing = typeof listings.$inferInsert
