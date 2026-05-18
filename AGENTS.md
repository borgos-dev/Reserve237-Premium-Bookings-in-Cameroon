<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Reserve237 AI Development Rules

Reserve237 is a premium multi-category reservation platform for Cameroon.

This is a completely new project.

DO NOT:
- reuse pokemon.ts
- copy Pokémon components
- reference Pokémon naming conventions
- use Pokémon-specific UI
- use Pokémon routes or schemas

You MAY reuse architectural concepts from previous projects:
- Zustand patterns
- search/filter logic
- favorites persistence
- responsive component structure
- Clerk authentication patterns

Current phase:
Frontend-only MVP.

DO NOT build:
- backend
- database
- API routes
- Prisma
- authentication backend

Use:
- mock data
- localStorage
- Zustand stores

Tech stack:
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Motion
- Shadcn UI
- Zustand
- next-themes
- Lucide React

Design philosophy:
Neo-minimalist premium UI with glassmorphism and luxury aesthetics.

Code requirements:
- production-quality
- reusable components
- accessible
- responsive
- mobile-first
- strongly typed 


# Reserve237 - Feature Specification

## Project Overview
Reserve237 is a listing platform that needs to implement search, favorites/wishlist, and details viewing functionality similar to a Pokemon browsing application.

---

## Core Features

### 1. **Search & Filter Page** (Home Page)
**Location:** `/`

**Features:**
- Search bar at the top where users can search listings by name/title in real-time
- Filter listings by category/type with category buttons
- "All" button to reset filters and show all listings
- Display listings in a card grid layout
- Each card shows:
  - Listing image
  - Listing title
  - Category/type badge with color coding
  - Heart/favorite icon button
  - Click card to view full details

**Functionality:**
- Real-time search as user types (filters matching listings)
- Category filtering (click category button to filter)
- Heart icon to add/remove from favorites
- Responsive card layout

---

### 2. **Favorites/Wishlist Page**
**Location:** `/favorites`

**Features:**
- View all saved favorite listings
- Each favorite shows in a card format:
  - Listing image
  - Listing title
  - Category badge
  - Delete button (trash icon) to remove from favorites
- Link to favorite listing's detail page
- Empty state message when no favorites exist

**Functionality:**
- Persistent storage (favorites saved in localStorage)
- Quick access to all wishlist items
- Easy removal of items from favorites

---

### 3. **Navbar with Favorites Indicator**
**Location:** Top navigation bar (global)

**Features:**
- Heart icon that indicates user has favorited listings
- When user has favorites:
  - Heart icon shows visually (filled or highlighted)
  - Optionally show count badge (e.g., "5" favorites)
  - Icon color changes to show active state
- Clicking heart icon navigates to `/favorites` page
- Links to:
  - Home
  - Contact
  - Favorites (with indicator)
  - Dark/Light mode toggle
  - User authentication (Clerk sign in/up)

---

### 4. **Listing Details Page**
**Location:** `/listing/[slug]`

**Features:**
- Display comprehensive listing information:
  - Large listing image/hero image
  - Listing title
  - Category/type badge with color coding
  - Full description
  - Key details:
    - Location
    - Price
    - Availability
    - Size/capacity (or relevant metrics)
  - Features list (amenities, highlights)
  - Specifications/stats:
    - Visual stat bars showing key metrics
  - Contact/booking information
  - Add to favorites button (heart icon)

**Functionality:**
- Dynamic routing based on listing slug (URL-friendly name)
- Type-colored backgrounds matching category
- Add/remove from favorites directly from details page
- Back button or link to return to listings
- Responsive layout (works on mobile and desktop)

---

## Technical Implementation Details

### State Management
- **Favorites Store:** Use Zustand with localStorage persistence
- Store structure:
  ```
  favorites: Listing[]
  toggleFavorite(listing): void
  clearAll(): void
  ```

### Data Structure
**Listing type should include:**
```
{
  id: number
  name: string
  slug: string (URL-friendly identifier)
  category: string
  image: string
  price: number (or relevant metric)
  description: string
  location: string (or address)
  features: string[]
  details: {
    availability: boolean/date
    capacity: number (or relevant spec)
    rating: number
    [other specific metrics]
  }
  [additional fields as needed]
}
```

### Color Coding System
- Each category should have an assigned color
- Use category color for:
  - Badge backgrounds
  - Detail page accents
  - Type indicators on cards

### Navigation Flow
```
Home (/) 
  ├── Search & Filter
  ├── Browse Listings
  └── Click Card → Listing Details (/listing/[slug])
  
Navbar
  ├── Home
  ├── Contact
  ├── Favorites ❤️ (with indicator)
  ├── Dark Mode Toggle
  └── User Auth (Clerk)

Favorites (/favorites)
  ├── View Saved Listings
  ├── Delete from Favorites
  └── Click to View Details
```

---

## UI/UX Requirements

1. **Search Bar:**
   - Prominent placement at top of home page
   - Large search icon
   - Placeholder text: "Search listings..."
   - Real-time filtering as user types

2. **Category Filter Buttons:**
   - Horizontal scrollable row
   - Each button has category color background
   - "All" button in black to reset filters
   - Active state indication

3. **Card Design:**
   - Rounded corners (border-radius: 22px typical)
   - Shadow effects with hover animations
   - Heart icon for favorites (top-right corner)
   - Color-coded category badge
   - Smooth transitions

4. **Details Page:**
   - Split layout: image on left, details on right (desktop)
   - Stack vertically on mobile
   - Color accent matching category
   - Clear typography hierarchy
   - Call-to-action buttons for booking/contact

5. **Dark Mode Support:**
   - All pages support light and dark themes
   - Use next-themes for theme switching
- Tailwind dark mode classes

---

## Technology Stack (Recommended)

- **Framework:** Next.js 16.2+ (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** Zustand
- **Icons:** React Icons / Lucide React
- **Authentication:** Clerk
- **Theme:** next-themes

---

## User Flow Summary

1. User lands on **Home page** → sees list of all listings
2. User **searches** by name or **filters by category**
3. User clicks **heart icon** on a card → listing added to favorites, icon highlights
4. User clicks **listing card** → navigates to **Details page**
5. User can **add/remove from favorites** on details page
6. User clicks **navbar heart icon** → navigates to **Favorites page**
7. On **Favorites page** → user sees all saved listings, can delete items
8. User clicks **Delete button** → removes from favorites

---

## Key Differences from Pokemon App

- Instead of "Pokemon" → "Listings"
- Instead of Pokemon stats → Listing details (price, availability, capacity, etc.)
- Same UI/UX pattern but adapted for reservation/listing platform
- All functionality (search, favorites, details) remains identical in concept