// ============================================
// RESERVE237 - CENTRALIZED DATA & TYPES
// ============================================

// ============================================
// TYPE DEFINITIONS
// ============================================

export type Category =
  | "restaurant"
  | "nightclub"
  | "lounge"
  | "bar"
  | "guesthouse"
  | "hotel"
  | "wedding-hall"
  | "corporate-space"
  | "event-venue";

export type City = "Yaounde" | "Douala" | "Limbe" | "Bafoussam" | "Bamenda";

export type Amenity =
  | "Live Music"
  | "WiFi"
  | "AC"
  | "Parking"
  | "Pool"
  | "Cafe"
  | "Bar"
  | "Restaurant"
  | "Gym"
  | "Spa"
  | "Garden"
  | "Rooftop"
  | "Outdoor Seating"
  | "Private Rooms"
  | "Catering"
  | "Sound System"
  | "Projector"
  | "Stage";

export interface Listing {
  id: number;
  name: string;
  image: string;
  images?: string[];
  category: Category;
  location: string;
  city: City;
  neighborhood?: string;
  rating: number;
  reviews: number;
  price: string;
  priceRange?: "budget" | "mid-range" | "premium" | "luxury";
  verified: boolean;
  tags: Amenity[];
  description?: string;
  capacity?: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  hours?: {
    open: string;
    close: string;
    days: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  featured?: boolean;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  listings: Listing[];
}

// ============================================
// RESTAURANT & NIGHTLIFE LISTINGS
// ============================================

export const restaurants: Listing[] = [
  {
    id: 1,
    name: "Sky Lounge Bastos",
    image: "https://images.unsplash.com/photo-1758165532022-a68f291317ba?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1758165532022-a68f291317ba?w=1200&q=80",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80",
      "https://images.unsplash.com/photo-1547138000-e8b43c87b285?w=1200&q=80",
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80",
    ],
    category: "lounge",
    location: "Bastos, Yaounde",
    city: "Yaounde",
    neighborhood: "Bastos",
    rating: 4.9,
    reviews: 234,
    price: "15,000 XAF avg",
    priceRange: "premium",
    verified: true,
    tags: ["Live Music", "WiFi", "Rooftop", "Bar"],
    description: "Elegant rooftop lounge with panoramic city views, signature cocktails, and live jazz on weekends.",
    capacity: 120,
    phone: "+237 6XX XXX XXX",
    whatsapp: "+237 6XX XXX XXX",
    hours: {
      open: "18:00",
      close: "02:00",
      days: "Mon-Sun"
    },
    featured: true
  },
  {
    id: 2,
    name: "One Rooftop",
    image: "/onerooftop 1.jpg",
    images: [
      "/onerooftop 1.jpg",
      "/onerooftop 2.jpg",
      "/onerooftop 3.jpg",
      "/onerooftop 4.jpg",
    ],
    category: "nightclub",
    location: "Plateau, Yaounde",
    city: "Yaounde",
    neighborhood: "Plateau",
    rating: 4.7,
    reviews: 189,
    price: "20,000 XAF avg",
    priceRange: "premium",
    verified: true,
    tags: ["Live Music", "AC", "Bar", "Outdoor Seating"],
    description: "Upscale nightclub with international DJs, VIP sections, and premium bottle service.",
    capacity: 250,
    phone: "+237 6XX XXX XXX",
    whatsapp: "+237 6XX XXX XXX",
    hours: {
      open: "20:00",
      close: "04:00",
      days: "Thu-Sat"
    },
    featured: true
  },
  {
    id: 3,
    name: "Terrace 237",
    image: "https://images.unsplash.com/photo-1567760200592-13504b6d495a?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1567760200592-13504b6d495a?w=1200&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&q=80",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=80",
    ],
    category: "lounge",
    location: "Centre Ville, Yaounde",
    city: "Yaounde",
    neighborhood: "Centre Ville",
    rating: 4.8,
    reviews: 156,
    price: "12,000 XAF avg",
    priceRange: "mid-range",
    verified: true,
    tags: ["WiFi", "Cafe", "Outdoor Seating", "Bar"],
    description: "Cozy terrace lounge perfect for after-work drinks and casual dining.",
    capacity: 80,
    featured: false
  },
  {
    id: 10,
    name: "Le Biniou Restaurant",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
      "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
    ],
    category: "restaurant",
    location: "Bastos, Yaounde",
    city: "Yaounde",
    neighborhood: "Bastos",
    rating: 4.9,
    reviews: 312,
    price: "18,000 XAF avg",
    priceRange: "premium",
    verified: true,
    tags: ["WiFi", "AC", "Parking", "Private Rooms"],
    description: "Fine dining French-Cameroonian fusion cuisine in an elegant setting.",
    capacity: 100,
    featured: true
  },
  {
    id: 11,
    name: "La Terrasse du Palais",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
      "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    ],
    category: "restaurant",
    location: "Bonapriso, Douala",
    city: "Douala",
    neighborhood: "Bonapriso",
    rating: 4.8,
    reviews: 267,
    price: "16,000 XAF avg",
    priceRange: "premium",
    verified: true,
    tags: ["WiFi", "AC", "Outdoor Seating", "Bar"],
    description: "Mediterranean cuisine with ocean views and sunset dining experience.",
    capacity: 90,
    featured: true
  },
  {
    id: 12,
    name: "Chez Wou",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
    ],
    category: "restaurant",
    location: "Akwa, Douala",
    city: "Douala",
    neighborhood: "Akwa",
    rating: 4.6,
    reviews: 198,
    price: "10,000 XAF avg",
    priceRange: "mid-range",
    verified: true,
    tags: ["WiFi", "AC", "Parking"],
    description: "Authentic Cameroonian dishes in a modern, comfortable atmosphere.",
    capacity: 70
  }
];

// ============================================
// GUEST HOUSE & HOTEL LISTINGS
// ============================================

export const guestHouses: Listing[] = [
  {
    id: 4,
    name: "Villa Serenity",
    image: "https://images.unsplash.com/photo-1744776411214-31209006a0f6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1744776411214-31209006a0f6?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
    ],
    category: "guesthouse",
    location: "Bonapriso, Douala",
    city: "Douala",
    neighborhood: "Bonapriso",
    rating: 4.9,
    reviews: 98,
    price: "35,000 XAF/night",
    priceRange: "premium",
    verified: true,
    tags: ["WiFi", "AC", "Pool", "Parking"],
    description: "Luxurious guest house with private pool, garden, and concierge service.",
    capacity: 12,
    featured: true
  },
  {
    id: 5,
    name: "Casa Tranquila",
    image: "https://images.unsplash.com/photo-1744776411255-3c427c203685?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1744776411255-3c427c203685?w=1200&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    ],
    category: "guesthouse",
    location: "Bonanjo, Douala",
    city: "Douala",
    neighborhood: "Bonanjo",
    rating: 4.8,
    reviews: 145,
    price: "28,000 XAF/night",
    priceRange: "mid-range",
    verified: true,
    tags: ["WiFi", "Cafe", "AC", "Garden"],
    description: "Peaceful retreat with lush gardens and complimentary breakfast.",
    capacity: 8,
    featured: true
  },
  {
    id: 6,
    name: "Garden Retreat",
    image: "https://images.unsplash.com/photo-1744776411221-702f2848b0b2?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1744776411221-702f2848b0b2?w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    ],
    category: "guesthouse",
    location: "Akwa, Douala",
    city: "Douala",
    neighborhood: "Akwa",
    rating: 4.7,
    reviews: 112,
    price: "32,000 XAF/night",
    priceRange: "premium",
    verified: true,
    tags: ["WiFi", "AC", "Restaurant", "Spa"],
    description: "Boutique guest house with spa facilities and gourmet restaurant.",
    capacity: 10,
    featured: false
  },
  {
    id: 13,
    name: "Residence Le Paradis",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
    ],
    category: "hotel",
    location: "Bastos, Yaounde",
    city: "Yaounde",
    neighborhood: "Bastos",
    rating: 4.9,
    reviews: 387,
    price: "45,000 XAF/night",
    priceRange: "luxury",
    verified: true,
    tags: ["WiFi", "AC", "Pool", "Gym", "Restaurant", "Bar", "Spa"],
    description: "5-star hotel with full amenities, business center, and conference facilities.",
    capacity: 80,
    featured: true
  },
  {
    id: 14,
    name: "Mboa Hotel",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80",
      "https://images.unsplash.com/photo-1744776411214-31209006a0f6?w=1200&q=80",
    ],
    category: "hotel",
    location: "Centre Ville, Yaounde",
    city: "Yaounde",
    neighborhood: "Centre Ville",
    rating: 4.5,
    reviews: 234,
    price: "25,000 XAF/night",
    priceRange: "mid-range",
    verified: true,
    tags: ["WiFi", "AC", "Restaurant", "Parking"],
    description: "Modern city hotel with convenient location and business facilities.",
    capacity: 50
  }
];

// ============================================
// EVENT VENUE LISTINGS
// ============================================

export const eventVenues: Listing[] = [
  {
    id: 7,
    name: "Grand Ballroom Yaounde",
    image: "https://images.unsplash.com/photo-1774989423979-6a7bf5add3f0?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1774989423979-6a7bf5add3f0?w=1200&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f29da8c4b0?w=1200&q=80",
      "https://images.unsplash.com/photo-1744776411221-72b8bb5665e6?w=1200&q=80",
      "https://images.unsplash.com/photo-1604077787574-7e8a39c10c9c?w=1200&q=80",
    ],
    category: "wedding-hall",
    location: "Bastos, Yaounde",
    city: "Yaounde",
    neighborhood: "Bastos",
    rating: 4.9,
    reviews: 87,
    price: "500+ Capacity",
    priceRange: "luxury",
    verified: true,
    tags: ["AC", "WiFi", "Sound System", "Catering", "Parking"],
    description: "Elegant ballroom perfect for weddings, galas, and large celebrations.",
    capacity: 600,
    featured: true
  },
  {
    id: 8,
    name: "Le Palais Events",
    image: "https://images.unsplash.com/photo-1744776411223-71fb5794617a?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1744776411223-71fb5794617a?w=1200&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f29da8c4b0?w=1200&q=80",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80",
    ],
    category: "corporate-space",
    location: "Bonapriso, Douala",
    city: "Douala",
    neighborhood: "Bonapriso",
    rating: 4.8,
    reviews: 124,
    price: "300+ Capacity",
    priceRange: "premium",
    verified: true,
    tags: ["WiFi", "AC", "Projector", "Sound System", "Catering"],
    description: "Modern conference center with state-of-the-art AV equipment.",
    capacity: 350,
    featured: true
  },
  {
    id: 9,
    name: "Crystal Hall",
    image: "https://images.unsplash.com/photo-1744776411221-72b8bb5665e6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1744776411221-72b8bb5665e6?w=1200&q=80",
      "https://images.unsplash.com/photo-1774989423979-6a7bf5add3f0?w=1200&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f29da8c4b0?w=1200&q=80",
      "https://images.unsplash.com/photo-1620744595869-4d2dba1cb89e?w=1200&q=80",
    ],
    category: "wedding-hall",
    location: "Plateau, Yaounde",
    city: "Yaounde",
    neighborhood: "Plateau",
    rating: 4.9,
    reviews: 156,
    price: "400+ Capacity",
    priceRange: "luxury",
    verified: true,
    tags: ["AC", "WiFi", "Stage", "Sound System", "Catering", "Garden"],
    description: "Stunning crystal chandelier hall with indoor and outdoor ceremony spaces.",
    capacity: 450,
    featured: true
  },
  {
    id: 15,
    name: "Salle Royale",
    image: "https://images.unsplash.com/photo-1519167758481-83f29da8c4b0?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f29da8c4b0?w=1200&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      "https://images.unsplash.com/photo-1744776411223-71fb5794617a?w=1200&q=80",
      "https://images.unsplash.com/photo-1774989423979-6a7bf5add3f0?w=1200&q=80",
    ],
    category: "event-venue",
    location: "Akwa, Douala",
    city: "Douala",
    neighborhood: "Akwa",
    rating: 4.7,
    reviews: 203,
    price: "250+ Capacity",
    priceRange: "mid-range",
    verified: true,
    tags: ["AC", "WiFi", "Sound System", "Parking"],
    description: "Versatile event space suitable for weddings, conferences, and parties.",
    capacity: 280
  },
  {
    id: 16,
    name: "Espace Prestige",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      "https://images.unsplash.com/photo-1744776411223-71fb5794617a?w=1200&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f29da8c4b0?w=1200&q=80",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80",
    ],
    category: "corporate-space",
    location: "Bastos, Yaounde",
    city: "Yaounde",
    neighborhood: "Bastos",
    rating: 4.8,
    reviews: 167,
    price: "200+ Capacity",
    priceRange: "premium",
    verified: true,
    tags: ["WiFi", "AC", "Projector", "Sound System", "Catering", "Private Rooms"],
    description: "Premium corporate event space with modular room configurations.",
    capacity: 220,
    featured: false
  }
];

// ============================================
// ALL LISTINGS COMBINED
// ============================================

export const allListings: Listing[] = [
  ...restaurants,
  ...guestHouses,
  ...eventVenues
];

// ============================================
// CURATED COLLECTIONS
// ============================================

export const collections: Collection[] = [
  {
    id: "rooftops-yaounde",
    title: "Top Rooftops in Yaounde",
    subtitle: "Sky-high dining and cocktails",
    category: "nightlife",
    listings: [
      restaurants[0], // Sky Lounge Bastos
      restaurants[1], // One Rooftop
      restaurants[2], // Terrace 237
    ]
  },
  {
    id: "getaways-douala",
    title: "Quiet Getaways in Douala",
    subtitle: "Peaceful stays for your rest",
    category: "stays",
    listings: [
      guestHouses[0], // Villa Serenity
      guestHouses[1], // Casa Tranquila
      guestHouses[2], // Garden Retreat
    ]
  },
  {
    id: "verified-venues",
    title: "Verified Event Venues",
    subtitle: "Perfect spaces for your celebrations",
    category: "events",
    listings: [
      eventVenues[0], // Grand Ballroom Yaounde
      eventVenues[1], // Le Palais Events
      eventVenues[2], // Crystal Hall
    ]
  },
  {
    id: "premium-dining",
    title: "Premium Dining Experiences",
    subtitle: "Fine cuisine across Cameroon",
    category: "restaurants",
    listings: [
      restaurants[3], // Le Biniou Restaurant
      restaurants[4], // La Terrasse du Palais
      restaurants[5], // Chez Wou
    ]
  },
  {
    id: "luxury-hotels",
    title: "Luxury Hotels & Resorts",
    subtitle: "5-star accommodations",
    category: "stays",
    listings: [
      guestHouses[3], // Residence Le Paradis
      guestHouses[0], // Villa Serenity
      guestHouses[2], // Garden Retreat
    ]
  }
];

// ============================================
// FEATURED LISTINGS
// ============================================

export const featuredListings = allListings.filter(listing => listing.featured);

// ============================================
// FILTER & SEARCH HELPERS
// ============================================

export function getListingsByCategory(category: Category): Listing[] {
  return allListings.filter(listing => listing.category === category);
}

export function getListingsByCity(city: City): Listing[] {
  return allListings.filter(listing => listing.city === city);
}

export function getListingsByPriceRange(priceRange: Listing['priceRange']): Listing[] {
  return allListings.filter(listing => listing.priceRange === priceRange);
}

export function getVerifiedListings(): Listing[] {
  return allListings.filter(listing => listing.verified);
}

export function searchListings(query: string): Listing[] {
  const lowerQuery = query.toLowerCase();
  return allListings.filter(listing =>
    listing.name.toLowerCase().includes(lowerQuery) ||
    listing.location.toLowerCase().includes(lowerQuery) ||
    listing.description?.toLowerCase().includes(lowerQuery) ||
    listing.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getTopRatedListings(minRating: number = 4.8): Listing[] {
  return allListings
    .filter(listing => listing.rating >= minRating)
    .sort((a, b) => b.rating - a.rating);
}

// ============================================
// LOCATION DATA
// ============================================

export const cities: City[] = ["Yaounde", "Douala", "Limbe", "Bafoussam", "Bamenda"];

export const yaoundeNeighborhoods = [
  "Bastos",
  "Plateau",
  "Centre Ville",
  "Nlongkak",
  "Mvan",
  "Odza",
  "Emana"
];

export const doualaNeighborhoods = [
  "Bonapriso",
  "Bonanjo",
  "Akwa",
  "Deido",
  "Bali",
  "Makepe",
  "Bonaberi"
];

// ============================================
// STATISTICS & DASHBOARD DATA
// ============================================

export const platformStats = {
  totalListings: allListings.length,
  totalRestaurants: restaurants.length,
  totalGuestHouses: guestHouses.length,
  totalEventVenues: eventVenues.length,
  averageRating: (allListings.reduce((sum, l) => sum + l.rating, 0) / allListings.length).toFixed(1),
  verifiedPercentage: Math.round((getVerifiedListings().length / allListings.length) * 100)
};

// ============================================
// MOCK DASHBOARD DATA
// ============================================

export const dashboardStats = [
  { name: "Monthly Revenue", value: "2.4M XAF", change: "+23.1%", trend: "up" },
  { name: "Occupancy Rate", value: "87%", change: "+8.2%", trend: "up" },
  { name: "Total Bookings", value: "1,247", change: "+12.5%", trend: "up" },
  { name: "Total Guests", value: "4,892", change: "+15.3%", trend: "up" },
];

export const weeklyChartData = [
  { name: "Mon", bookings: 24, revenue: 360000 },
  { name: "Tue", bookings: 32, revenue: 480000 },
  { name: "Wed", bookings: 28, revenue: 420000 },
  { name: "Thu", bookings: 45, revenue: 675000 },
  { name: "Fri", bookings: 62, revenue: 930000 },
  { name: "Sat", bookings: 78, revenue: 1170000 },
  { name: "Sun", bookings: 56, revenue: 840000 },
];

export const recentReservations = [
  {
    id: "RES001",
    customer: "Alice Johnson",
    listing: "Sky Lounge Bastos",
    type: "Table",
    date: "2026-05-24",
    time: "19:00",
    guests: 4,
    status: "Confirmed",
    amount: "60,000 XAF"
  },
  {
    id: "RES002",
    customer: "Bob Smith",
    listing: "Villa Serenity",
    type: "Room",
    date: "2026-05-24 - 05-26",
    time: "2 nights",
    guests: 2,
    status: "Pending",
    amount: "70,000 XAF"
  },
  {
    id: "RES003",
    customer: "Carol White",
    listing: "Le Biniou Restaurant",
    type: "Table",
    date: "2026-05-24",
    time: "19:30",
    guests: 6,
    status: "Confirmed",
    amount: "108,000 XAF"
  },
  {
    id: "RES004",
    customer: "David Brown",
    listing: "Grand Ballroom Yaounde",
    type: "Event",
    date: "2026-05-25",
    time: "18:00",
    guests: 150,
    status: "Confirmed",
    amount: "2,500,000 XAF"
  },
];
