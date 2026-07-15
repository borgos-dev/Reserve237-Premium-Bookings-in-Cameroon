// Shared public listing type used across all customer-facing pages.
// Mapped from the Supabase DB — replaces the old mock Listing type.

// A named service with its own price (spa treatments, menu highlights,
// vehicle day-rates…) — displayed as a menu card on the listing page.
export interface ListingService {
  name: string
  priceXaf: number
}

export interface PublicListing {
  id: string                    // UUID from DB
  name: string
  slug: string
  image: string                 // primary image URL (Supabase Storage or external)
  mainCategory: string          // food-drinks | nightlife | beauty-wellness | events-venues | accommodation | transport-more
  subCategory: string           // restaurant | hotel | salon | etc.
  location: string              // formatted as "City, Neighbourhood" for display
  city: string
  neighborhood: string | null
  address: string | null
  phone: string | null
  whatsapp: string | null
  rating: number
  reviewCount: number
  priceMin: number | null       // base price in XAF — used to compute booking totals. null = not bookable online
  priceLabel: string | null     // "From 15,000 XAF" or "35,000 XAF/night"
  priceRange: string | null     // budget | mid-range | premium | luxury
  verified: boolean
  featured: boolean
  amenities: string[]
  capacity: number | null       // max guests per booking (from details JSONB)
  services: ListingService[]    // priced services/menu items (from details JSONB)
}
