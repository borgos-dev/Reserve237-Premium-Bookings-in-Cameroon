import 'dotenv/config'
import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { listings, listingAmenities, listingImages } from './schema'
import { allListings } from '../data/listings'

dotenv.config({ path: '.env.local' })

const CATEGORY_MAP: Record<string, string> = {
  restaurant: 'food-drinks',
  bar: 'nightlife',
  lounge: 'nightlife',
  nightclub: 'nightlife',
  guesthouse: 'accommodation',
  hotel: 'accommodation',
  'wedding-hall': 'events-venues',
  'corporate-space': 'events-venues',
  'event-venue': 'events-venues',
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractPriceMin(price: string): number | undefined {
  const digits = price.replace(/[^\d]/g, '')
  const n = Number(digits)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

async function seed() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  const client = postgres(connectionString, { prepare: false })
  const db = drizzle(client)

  console.log('🌱 Seeding listings...\n')

  for (const listing of allListings) {
    const slug = generateSlug(listing.name)
    const mainCategory = CATEGORY_MAP[listing.category] ?? 'food-drinks'

    const [inserted] = await db
      .insert(listings)
      .values({
        name: listing.name,
        slug,
        mainCategory,
        subCategory: listing.category,
        description: listing.description,
        city: listing.city,
        neighborhood: listing.neighborhood ?? null,
        address: listing.location,
        lat: listing.coordinates?.lat?.toString() ?? null,
        lng: listing.coordinates?.lng?.toString() ?? null,
        phone: listing.phone ?? null,
        whatsapp: listing.whatsapp ?? null,
        priceLabel: listing.price,
        priceMin: extractPriceMin(listing.price) ?? null,
        priceRange: listing.priceRange ?? null,
        rating: listing.rating.toString(),
        reviewCount: listing.reviews,
        verified: listing.verified,
        featured: listing.featured ?? false,
        active: true,
      })
      .onConflictDoNothing()
      .returning()

    if (!inserted) {
      console.log(`  ⏭  Skipped (already exists): ${listing.name}`)
      continue
    }

    // Insert images
    const images = listing.images?.length ? listing.images : [listing.image]
    await db.insert(listingImages).values(
      images.map((url, i) => ({
        listingId: inserted.id,
        url,
        alt: `${listing.name} photo ${i + 1}`,
        order: i,
        isPrimary: i === 0,
      }))
    )

    // Insert amenities
    if (listing.tags.length) {
      await db.insert(listingAmenities).values(
        listing.tags.map((name) => ({ listingId: inserted.id, name }))
      )
    }

    console.log(`  ✓  ${listing.name} (${mainCategory} / ${listing.city})`)
  }

  console.log(`\n✅ Seeded ${allListings.length} listings successfully!`)
  await client.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
