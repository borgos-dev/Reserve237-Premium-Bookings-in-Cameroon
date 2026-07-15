# Reserve237 — Project Notes & Build Log

> **Purpose:** This file is the living record of all decisions, architecture choices, and progress for the Reserve237 project. Every new session should read this file first. Every significant change should be logged here.

---

## Project Identity

**Reserve237** is a premium multi-category reservation and listing platform built for the Cameroonian market. Think Booking.com + TripAdvisor but built specifically for Cameroon — with Mobile Money, French/English bilingualism, and local business onboarding as first-class features.

**Target market:** Cameroon first, then francophone/anglophone West & Central Africa.
**Business model:** See full monetisation strategy below.

---

## Monetisation Strategy (decided 2026-06-01)

### How the platform earns money — 3 phases

**Phase 1 — Launch (0 → 100 partners) FREE**
- No commission. No subscription. No fees.
- Goal: get listings on the platform, build trust, prove value.
- Pitch: "List for free today — we only start earning when you do, and not until 2027."
- Critical: empty marketplace earns nothing. Supply first.

**Phase 2 — Growing (100 → 500 partners) SUBSCRIPTIONS**
| Plan | Price | What they get |
|---|---|---|
| Free | 0 XAF/month | 1 listing, 3 photos, basic placement |
| Standard | 5,000 XAF/month | 3 listings, 10 photos, verified badge, WhatsApp notifications |
| Premium | 15,000 XAF/month | Unlimited listings, priority search, analytics, homepage featured |

- Subscription collected via MTN MoMo / Orange Money monthly
- Freemium gate: free plan = 1 listing max, 3 photos max
- Need to build: plan system in DB + pricing page at `/pricing`

**Phase 3 — Scale (500+ partners) COMMISSION + PROMOTED**
- 7% service fee charged to customer (ALREADY BUILT in BookingPage.tsx + bookings table)
- Campay (MTN MoMo + Orange Money) must be integrated first to capture this revenue
- Promoted listings: 10,000 XAF/week to appear at top of search
- Featured on homepage: 25,000 XAF/month
- Projected: 200 Standard + 50 Premium partners = ~1.75M XAF/month before commissions

**Key decision on phone/WhatsApp at registration:**
- Do NOT require during registration (adds friction, reduces completions)
- Add phone/WhatsApp as OPTIONAL fields in Step 2
- Prompt via dashboard onboarding checklist after registration
- A listing without phone shows "⚠ Add contact info" warning

**Key decision on Clerk vs Google sign-in:**
- Keep Clerk (10,000 MAU free tier is more than enough for Cameroon launch)
- The "development keys" warning = just switch to production keys when deploying
- Enable Google OAuth in Clerk Dashboard → Social Connections (no code changes needed)
- Create Google OAuth app in Google Cloud Console, paste Client ID + Secret into Clerk

---

## Business UX Improvement Plan (priority order)

These are the UX gaps identified from a full flow walkthrough (2026-06-01):

### 🔴 Critical — Must fix now
1. **Landing page: fake stats** — Replace "500+ Active Listings, 12K+ Bookings" with honest copy
2. **Landing page: no "How it works"** — Add 3-step section with MTN MoMo mention
3. **Landing page: no pricing info** — Add "Free to list. 7% per booking." line
4. **Registration Step 2: no phone/WhatsApp** — Add as optional fields
5. **Registration Step 2: no sub-category** — Add type selector after category
6. **Registration Step 3: Terms/Privacy are dead links** — Create placeholder pages
7. **Dashboard: empty state for new partners** — Add onboarding checklist

### 🟡 Important — Fix soon
8. **Verification Step 4: no resend timer** — Add 60-second cooldown
9. **Verification Step 4: no "wrong email" escape** — Add back link
10. **Landing page: no social proof** — Add real testimonials when available

### 🟢 Nice to have
11. **Registration: category preview** — Show "As a Food & Drinks partner you get..." blurb
12. **Registration: Google sign-in** — Enable in Clerk dashboard (no code needed)

### Build status — ALL COMPLETE ✅ (2026-06-01)
- [x] Fix landing page → honest copy, How it works, pricing, MoMo logos
- [x] Fix Step 2 → sub-type selector, phone, WhatsApp (optional, samePhone toggle)
- [x] Fix Step 3 → /terms and /privacy pages created, real Link components
- [x] Fix Step 4 → 60s resend cooldown, "wrong email? go back" escape
- [x] Dashboard onboarding checklist → shown when partner has 0 listings

### 2026-06-01 — Session 12: Business UX improvements

**Files created:**
- `src/app/terms/page.tsx` — Full Terms of Service page (9 sections, real content)
- `src/app/privacy/page.tsx` — Full Privacy Policy page (7 sections, real content)

**Files modified:**
- `src/app/business/page.tsx` — Complete rewrite:
  - Hero: honest copy ("List your business. Get booked online."), launch badge ("Now launching in Yaoundé & Douala"), pricing pill ("Free to list. 7% on confirmed bookings."), MTN MoMo + Orange Money logos
  - "How it works": 3-step section with icons and connector line
  - Pricing section: checklist of 6 points + MoMo logos
  - Features: updated copy, removed "hundreds of partners" fake claims
  - CTA: teal background, honest "Be Among the First Partners in Cameroon"
- `src/app/business/sign-up/[[...sign-up]]/page.tsx`:
  - Step 2: Added `SUB_TYPES` map (5 options per category), sub-type selector (required), phone (optional), WhatsApp (optional with "same as phone" toggle), updated placeholder from "Sky Lounge Bastos" to "Mama Ngozi Restaurant"
  - Step 3: `<span>` tags for Terms/Privacy replaced with real `<Link href="/terms">` and `<Link href="/privacy">` (open in new tab)
  - Step 4: 60-second resend cooldown with countdown timer, "Wrong email address? Go back to change it" escape link
- `src/actions/businesses.ts` — `BusinessProfileInput` extended with `subType?`, `phone?`, `whatsapp?`; `setupBusinessProfile` saves phone + whatsapp to DB on sign-up
- `src/components/dashboard/DashboardOverview.tsx` — Added `OnboardingChecklist` component:
  - Shows when `stats.totalListings === 0` (new partner)
  - 5 steps: account created ✓ → add listing → upload photos → set availability → complete profile
  - Progress bar (20% → 100% as steps complete)
  - Stat cards shown but dimmed/non-interactive for new partners
  - Each incomplete step has a direct CTA link to the relevant page

---

## Current Platform State (as of 2026-06-01)

### ✅ BUILT — Business (Partner) Side
| Feature | Status |
|---|---|
| Partner landing page `/business` | ✅ Live — honest copy, How it works, MoMo logos, pricing |
| Partner sign-up `/business/sign-up` | ✅ Live — 4-step wizard (category → details → account → verify) |
| Partner sign-in `/business/sign-in` | ✅ Live — email+password, forgot password link |
| Forgot password `/forgot-password` | ✅ Live — 2-step (email code → reset), works for both user types |
| Business data saved to DB on sign-up | ✅ Live — `setupBusinessProfile` saves name/category/city/phone on verify |
| Dashboard overview `/dashboard` | ✅ Live — real stats (bookings, revenue, listings), real chart |
| Dashboard listings `/dashboard/listings` | ✅ Live — create/edit/delete/toggle listings + Supabase Storage photo upload |
| Dashboard reservations `/dashboard/reservations` | ✅ Live — confirm/reject/complete bookings with real DB |
| Dashboard availability `/dashboard/availability` | ✅ Live — interactive calendar, block/unblock dates + range tool |
| Dashboard settings `/dashboard/settings` | ✅ Live — edit profile, social links, change password, delete account |
| Dashboard shell (sidebar + topbar) | ✅ Live — shared across all 5 dashboard pages |
| Partner onboarding checklist | ✅ Live — shown when 0 listings, guides first steps |
| Middleware route protection | ✅ Live — `/dashboard/*` requires auth |

### ✅ BUILT — Customer (User) Side
| Feature | Status |
|---|---|
| Homepage with real DB listings | ✅ Live — 6 category filter, search, curated collections from DB |
| Customer sign-up `/sign-up` | ✅ Live — custom split-layout form (name, email, password, phone) |
| Customer sign-in `/sign-in` | ✅ Live — custom form, forgot password link |
| Listing detail page `/listing/[slug]` | ✅ Live — real photos, amenities, reviews from DB, WhatsApp button |
| Booking form `/listing/[slug]/book` | ✅ Live — submits to Supabase `bookings` table |
| Favorites `/favorites` | ✅ Live — Zustand + localStorage + DB sync for logged-in users |
| Customer profile `/profile` | ✅ Live — name edit, booking history (upcoming/past), cancel, leave review |
| Real reviews | ✅ Live — submit from profile, display on listing page, updates listing rating |
| Terms of Service `/terms` | ✅ Live — 9 sections, real content |
| Privacy Policy `/privacy` | ✅ Live — 7 sections, real content |
| "My Bookings" navbar link | ✅ Live — shown for signed-in customers, "Dashboard" for partners |

### ✅ BUILT — Infrastructure
| Feature | Status |
|---|---|
| Supabase PostgreSQL | ✅ Live — 9 tables: users, businesses, listings, listing_images, listing_amenities, bookings, reviews, favorites, availability |
| Drizzle ORM | ✅ Live — full schema, migrations, seed script |
| Supabase Storage | ✅ Live — `listings` bucket (10MB) + `avatars` bucket (5MB) |
| 16 seeded listings | ✅ Live — in DB with images and amenities |
| PublicListing type system | ✅ Live — shared type across all customer pages |

### ❌ NOT BUILT — Critical for Production
| Missing | Why it matters |
|---|---|
| **Campay payment integration** | 7% service fee captured as code but never charged. No real money flows. Biggest blocker. |
| **Email/WhatsApp booking confirmations** | No notification after booking. Customer has no proof. Partner has no alert. |
| **Date conflict validation** | Customers can book dates already taken. No cross-check with availability/bookings table. |
| **Admin panel** | No way to moderate listings, verify partners, or handle disputes. |
| **Production Clerk keys** | Currently on development keys. Switch to `pk_live_` / `sk_live_` before deploying. |
| **Production deployment** | Platform is not deployed anywhere. Only runs on localhost. |
| **SEO / Open Graph metadata** | No per-listing metadata. Won't rank on Google. |
| **Map integration** | Coordinates in DB unused. No map view for customers. |
| **Partner notification on new booking** | Partner gets no real-time alert when a new booking arrives. |
| **Payment withdrawal flow** | Dashboard "Withdraw to MoMo" button is UI-only — no backend. |
| **Business verification workflow** | "Verified" badge in marketing but no verification process built. |
| **Rate limiting** | Booking/review endpoints can be hammered with no protection. |

### ⚠️ PARTIALLY BUILT — Needs Completion
| Partial | Gap |
|---|---|
| Booking confirmations | Form submits to DB but no email/WhatsApp sent to either party |
| Dashboard listing card photos | Partner dashboard shows placeholder for all listing images (no photo display in the card grid) |
| Availability ↔ Booking link | Partners can block dates, but the booking form doesn't check them before accepting |
| Onboarding checklist completion | Progress bar stuck at 20% — steps 2-5 don't auto-complete based on actual DB data |
| Payment status | `paymentStatus` field always stays "pending" — never updated to "paid" |

---

## Full Platform Audit (2026-06-02)

### Launch Readiness: **38% / 100**

**Breakdown by area:**

| Area | Score | Notes |
|---|---|---|
| Business sign-up flow | 90% | 4-step wizard works, data saved to DB ✅ |
| Partner dashboard | 80% | All 5 pages work with real data. "Withdraw" and notifications missing. |
| Listings management | 85% | CRUD + photo upload to Supabase works. Card preview doesn't show photos. |
| Reservations management | 90% | Confirm/reject/complete all work against real DB ✅ |
| Availability calendar | 95% | Block/unblock/range all work ✅ |
| Dashboard settings | 90% | Profile, social links, password, delete account all work ✅ |
| Customer homepage | 85% | Real DB listings, 6-category filter, search ✅ |
| Customer sign-up/in | 90% | Custom forms, verification, forgot password ✅ |
| Listing detail page | 85% | Real data + reviews + WhatsApp button ✅ |
| Booking form | 50% | UI works, submits to DB. Payment is 0% — no money moves. |
| Payment processing | 0% | Campay not integrated. Biggest blocker. |
| Email/notifications | 5% | EmailJS configured for contact form only. No booking notifications. |
| Customer profile | 85% | Booking history, cancel, review submission ✅ |
| Favorites system | 90% | localStorage + DB sync ✅ |
| Reviews | 90% | Submit, display, rating recalculation ✅ |
| Auth & security | 75% | Clerk works, middleware protects dashboard. No rate limiting, no CSRF. |
| FR/EN bilingual | 100% | Every page translated — customer, business, dashboard, legal (2026-06-13) ✅ |
| SEO | 10% | Basic metadata in layout. No per-listing OG tags. |
| Deployment | 0% | Not deployed. Dev keys only. |

### 2026-06-02 — Batch 1: Reliability fixes (excluding payment)

**1. Date conflict validation** (`src/actions/bookings.ts`)
- `createBooking` now runs `checkDateConflicts()` before inserting
- Checks `availability` table for blocked dates in requested range
- Checks `bookings` table for overlapping confirmed/pending bookings (SQL overlap condition)
- For single-date bookings: checks exact date is not blocked
- Returns user-facing error message if conflict found — displays in BookingPage.tsx

**2. Booking confirmation emails** (`src/lib/email.ts` + `src/actions/bookings.ts`)
- Created `src/lib/email.ts` — EmailJS REST API helper (works server-side via fetch)
- `sendBookingEmails()` sends two emails fire-and-forget (never blocks the booking submission):
  - Customer: booking confirmation with ref, dates, total, payment method
  - Partner: new booking alert with customer contact details
- Two new env vars in `.env.local`: `EMAILJS_TEMPLATE_BOOKING_CUSTOMER` and `EMAILJS_TEMPLATE_BOOKING_PARTNER`
- **ACTION REQUIRED:** Create 2 templates in EmailJS dashboard — see instructions below

**3. Dashboard listing card photos** (`src/actions/listings.ts` + `src/components/dashboard/ListingsManager.tsx`)
- `getPartnerListings()` now batch-fetches primary images in one extra query
- `PartnerListing` type updated to include `image: string | null`
- `ListingsManager` listing cards now show actual photo (with `Next/Image`) if one was uploaded
- Falls back to "No photo yet" placeholder if listing has no photos
- Optimistic UI on new listing: shows the first upload preview as the card image

**EmailJS Templates to create:**

Go to emailjs.com → Email Templates → Create Template

**Template 1 — Customer booking confirmation** (save the ID as `EMAILJS_TEMPLATE_BOOKING_CUSTOMER`):
```
Subject: Your booking at {{listing_name}} is confirmed — Reserve237
Body:
Hi {{to_name}},

Your booking has been received and is pending confirmation.

📋 Booking reference: {{booking_ref}}
🏢 Listing: {{listing_name}}
📅 Date: {{dates}}
👥 Guests: {{guests}}
💰 Total: {{total}}
💳 Payment: {{payment_method}}

The business will confirm your booking shortly. You can view your bookings at reserve237.com/profile.

Thank you for using Reserve237!
```

**Template 2 — Partner new booking alert** (save the ID as `EMAILJS_TEMPLATE_BOOKING_PARTNER`):
```
Subject: New booking at {{listing_name}} — Reserve237
Body:
Hi {{to_name}},

You have a new booking request!

📋 Booking reference: {{booking_ref}}
🏢 Your listing: {{listing_name}}
📅 Date: {{dates}}
👥 Guests: {{guests}}
💰 Total: {{total}}
💳 Payment: {{payment_method}}

Customer contact:
- Name: {{customer_name}}
- Phone: {{customer_phone}}
- Email: {{customer_email}}

Log in to your dashboard to confirm or reject this booking: reserve237.com/dashboard/reservations
```

After creating both templates, paste their IDs into .env.local.

### 2026-06-02 — FR/EN Bilingual (before Batch 2)

**Why now:** Douala (primary launch city) is over 80% French-speaking. Launching English-only would severely limit adoption. French is set as the DEFAULT language.

**Architecture:** Client-side context with localStorage persistence. No URL routing changes needed. Server renders with French by default.

**Files created:**
- `src/lib/translations.ts` — ~200 key-value pairs in both `fr` and `en`. Covers: navbar, categories (6), homepage search/filter, curated collections, listing detail, booking form (all labels + confirmation modal), sign-in form, sign-up form (including left panel benefits + verification step), favorites page, customer profile (tabs, booking cards, review form, status badges). TypeScript typed as `as const`.
- `src/contexts/LanguageContext.tsx` — `LanguageProvider` with `useState`, `localStorage` persistence under key `r237-lang`, updates `document.documentElement.lang` attribute for SEO/accessibility. Default: `"fr"`. Exports `useLanguage()` hook returning `{ lang, setLang, t }`.

**Files modified (9 components translated):**
- `src/app/layout.tsx` — Wrapped with `<LanguageProvider>`
- `src/components/homepage/NewNavbar.tsx` — Toggle now calls `setLang()`, shows `lang === "fr" ? "FR" : "EN"`. All nav links, auth buttons translated.
- `src/components/homepage/SearchFilterSection.tsx` — Search placeholder, "Browse by Category", category buttons, results count, clear filters all translated.
- `src/components/homepage/CuratedCollections.tsx` — Section title, subtitle, all collection titles/subtitles translated.
- `src/components/booking/BookingPage.tsx` — ALL form labels, payment methods, submit button, confirmation modal translated. Payment methods moved inside component to use `t()`.
- `src/components/listing/ListingDetailContent.tsx` — Back link, Verified Partner badge, About/Amenities/Reviews headings, Book Now, Save to Favourites, Contact on WhatsApp all translated.
- `src/app/sign-in/[[...sign-in]]/page.tsx` — Welcome back, form labels, buttons, footer links all translated.
- `src/app/sign-up/[[...sign-up]]/page.tsx` — Left panel (headline, subtitle, 4 benefits, payments via), all form labels, create account button, verification step (check email, code label, verify button, resend, wrong email escape) all translated.
- `src/app/favorites/page.tsx` — Page title, count, clear all, empty state, view details, remove tooltip all translated.
- `src/components/profile/ProfileContent.tsx` — StatusBadge uses `t()` (moved config inside component). Booking tabs, empty states, browse button, booking card labels (booking ID, total paid, view listing, write review, reviewed, cancel), review form (how was experience, share experience, placeholder, submit), edit/save profile buttons, name updated message, booking count all translated.

**How it works for the user:**
- Platform opens in French by default (first visit, no preference stored)
- User clicks FR/EN toggle in navbar → switches instantly, saves to localStorage
- Next visit: remembered preference loaded immediately
- `document.documentElement.lang` updated for screen readers and SEO

### 2026-06-02 — Batch 2: Quality + discovery fixes

**1. SEO metadata** (per listing page + homepage + business page + sitemap)
- `src/app/listing/[slug]/page.tsx` — Added `generateMetadata()` that generates dynamic title/description/OG image from DB listing data per slug. Title: "Sky Lounge Bastos — Nightlife in Yaoundé | Reserve237". Description: listing.description or generated fallback with price.
- `src/app/layout.tsx` — Improved root metadata: template title (`%s | Reserve237`), full keyword list, OpenGraph with `en_CM`/`fr_CM` locale, Twitter card, `metadataBase` from `NEXT_PUBLIC_APP_URL` env var.
- `src/app/business/page.tsx` — Added partner-specific metadata (title, description, OG).
- `src/app/sitemap.ts` — NEW: Dynamic sitemap. Static pages (home, /business, /contact, /terms, /privacy) + all active listings from DB. Auto-updates as listings are added. Route: `/sitemap.xml`
- Added `NEXT_PUBLIC_APP_URL=http://localhost:3000` to `.env.local` (change to real domain when deployed)
- **17 pages now generating** (was 16 before sitemap)

**2. Onboarding checklist auto-completion**
- `src/actions/dashboard.ts` — Added 3 new fields to `DashboardStats`: `hasPhotos`, `hasAvailabilitySet`, `hasProfileComplete`. Computed with 2 extra batched queries (listing_images + availability tables). `hasProfileComplete` checks businesses.phone or businesses.whatsapp.
- `src/components/dashboard/DashboardOverview.tsx` — `OnboardingChecklist` now accepts `stats` prop. Each step auto-detects from real data:
  - Step 1 (account) → always done ✅
  - Step 2 (add listing) → `stats.totalListings > 0`
  - Step 3 (upload photos) → `stats.hasPhotos`
  - Step 4 (set availability) → `stats.hasAvailabilitySet`
  - Step 5 (complete profile) → `stats.hasProfileComplete`
- Checklist stays visible until ALL 5 steps are complete (not just until first listing)

**3. Rate limiting**
- `src/lib/rateLimit.ts` — NEW: Simple in-process rate limiter using a Map. Auto-cleans expired entries every 5 minutes. Works in single-server and dev environments.
- `src/actions/bookings.ts` — `createBooking` checks rate limit: 20 booking attempts per IP per hour before any DB operation
- `src/actions/reviews.ts` — `submitReview` checks rate limit: 10 review submissions per IP per hour
- **Production note:** For Vercel serverless (multiple instances), upgrade to Upstash Redis + `@upstash/ratelimit`

### Three things that MUST be done before any real user touches this:

**1. Campay payment integration (~40 hours)**
Without this, the platform cannot charge anyone. The booking form collects a payment method but never charges it. A customer could "book" for free indefinitely.
- Integrate Campay SDK (campay.net)
- Create `/api/payment/initiate` route — calls Campay to start MoMo USSD push
- Create `/api/payment/webhook` — receives Campay callback, marks booking as paid + confirmed
- Test with MTN MoMo sandbox

**2. Booking confirmation notifications (~12 hours)**
Without this, customers don't know if their booking worked and partners don't know someone is coming.
- EmailJS (already configured) or Resend (better, free 100 emails/day)
- Email to customer: "Your booking at [listing] is confirmed for [date]"
- Email/WhatsApp to partner: "New booking from [name] for [date]"

**3. Date conflict validation (~8 hours)**
Without this, a listing could be double-booked. The booking form lets anyone book any date even if it's blocked or already taken.
- Before inserting a booking: check `availability` table for blocked dates
- Check `bookings` table for overlapping confirmed bookings
- Return error if conflict detected

**After those three: deploy to Vercel + switch to production Clerk keys = ~4 hours**

### What you CAN do right now (before payment):
- **Soft launch as a "directory + inquiry platform"** — businesses list for free, customers browse and request bookings, payment handled offline via WhatsApp
- **Show to investors** — UI is polished, flows work, DB is real
- **Onboard your first 10 partners manually** — add their listings yourself, get them visible

### Estimated timeline to full launch:
- Week 1: Payment integration (Campay) + booking confirmations
- Week 2: Date validation + deploy to Vercel + switch to production keys
- Week 3: French translation (next-intl) + SEO metadata
- Week 4: Testing with real Douala/Yaoundé businesses + bug fixes
- **= 4 weeks to a real, chargeable, deployed product**

---

## Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router) | ✅ Built |
| Language | TypeScript 5 (strict) | ✅ Built |
| Styling | Tailwind CSS 4 | ✅ Built |
| Animation | Motion (Framer Motion 11) | ✅ Built |
| Icons | React Icons 5 (Remix Icon set) | ✅ Built |
| State | Zustand 4.5.5 | ✅ Built |
| Auth | Clerk 7.3.5 | ✅ Built (dev keys) |
| Email | EmailJS 4.4.1 | ✅ Contact form only |
| Database | Supabase (PostgreSQL) | ✅ Built + live |
| ORM | Drizzle ORM 0.45.2 | ✅ Built |
| Storage | Supabase Storage | ✅ Built |
| Payments | Campay API | ❌ Not integrated |
| i18n | Custom LanguageContext + translations.ts | ✅ Built — every page FR/EN, French default |
| Maps | Mapbox / Google Maps | ❌ Not started |
| Notifications | Email/SMS/WhatsApp | ❌ Not started |
| Deployment | Vercel / any host | ❌ Not deployed |

---

## The 6 Categories (from product diagram)

These are the 6 umbrella categories of the platform. The current code has granular subcategories — these need to be reorganized under this structure.

```
Reserve237
├── Food & Drinks        → Restaurants, snack bars, cafés
├── Nightlife            → Night clubs, lounges, bars
├── Beauty & Wellness    → Salons, spas, barbershops
├── Events & Venues      → Halls, theatres, stadiums
├── Accommodation        → Hotels, guesthouses, villas
└── Transport & More     → Car hire, tours, clinics
```

### Current Category Types (in `src/data/listings.ts`)
```typescript
// Current (too granular, needs reorganization)
"restaurant" | "nightclub" | "lounge" | "bar" | 
"guesthouse" | "hotel" | "wedding-hall" | "corporate-space" | "event-venue"
```

### Target Category Structure (to be refactored)
```typescript
// New umbrella categories
type MainCategory = 
  | "food-drinks"
  | "nightlife"
  | "beauty-wellness"
  | "events-venues"
  | "accommodation"
  | "transport-more"

// Subcategories per main category
type SubCategory =
  // food-drinks
  | "restaurant" | "snack-bar" | "cafe" | "bakery" | "fast-food"
  // nightlife
  | "nightclub" | "lounge" | "bar" | "sports-bar" | "rooftop-bar"
  // beauty-wellness
  | "salon" | "spa" | "barbershop" | "nail-studio" | "massage-center"
  // events-venues
  | "wedding-hall" | "conference-room" | "stadium" | "theatre" | "outdoor-venue"
  // accommodation
  | "hotel" | "guesthouse" | "villa" | "apartment" | "hostel"
  // transport-more
  | "car-hire" | "tour-operator" | "clinic" | "pharmacy" | "travel-agency"
```

---

## Database Decision: Supabase + Drizzle ORM

### Why Supabase
After evaluating options (Firebase, PlanetScale, Neon, MongoDB Atlas):

- **PostgreSQL** — relational data is the right fit for bookings (users → bookings → listings → reviews)
- **Built-in Storage** — listing photos, business verification documents
- **Realtime subscriptions** — instant booking notifications for business owners
- **Row-Level Security (RLS)** — business owners only see their own data, no backend middleware needed
- **Free tier** is generous: 500MB DB, 1GB storage, 2GB bandwidth, unlimited API requests
- **Works natively with Next.js App Router** — server components can query directly
- **Edge Functions** — for payment webhooks (MTN MoMo callbacks)
- **Dashboard** — visual table management during development

### Why Drizzle ORM (not Prisma)
- TypeScript-first, schema-as-code (no separate `.prisma` file)
- Lightweight — no Prisma engine/binary overhead
- Works perfectly with Supabase PostgreSQL
- Direct SQL access when needed
- Great with Next.js App Router server components

### Planned Schema (high-level)

```sql
-- Core tables
users                  -- synced from Clerk (clerk_id, email, role, phone, whatsapp)
businesses             -- partner profiles (owner_id, name, description, verified, plan)
listings               -- all listings (business_id, main_category, sub_category, city, neighborhood, ...)
listing_images         -- images per listing (listing_id, url, order, is_primary)
listing_amenities      -- amenities per listing (listing_id, amenity_name)
bookings               -- all reservations (listing_id, user_id, dates, status, payment_method, total)
reviews                -- ratings & comments (listing_id, user_id, rating, body, created_at)
favorites              -- server-side favorites (user_id, listing_id) — replaces localStorage
availability           -- blocked dates per listing (listing_id, date, reason)

-- Category-specific detail tables (JSONB column per listing OR separate tables)
accommodation_details  -- room_types, checkin_time, checkout_time, breakfast_included
food_drink_details     -- cuisine_type, table_capacity, hours, has_delivery, has_takeaway
nightlife_details      -- dress_code, age_restriction, table_minimum_spend, vip_available
beauty_details         -- services[], appointment_duration_min, walk_in_available
event_venue_details    -- max_capacity, has_catering, has_av_equipment, outdoor_available
transport_details      -- vehicle_type, driver_included, max_passengers, per_day_rate
```

---

## Build Phases

### Phase 0 — Foundation Cleanup (Before Any Category) ✅ PARTIALLY DONE
- [x] Project structure created
- [x] Clerk auth integrated
- [x] 16 mock listings with helper functions
- [x] 3 Zustand stores (Category, Browse, Favorites)
- [x] Responsive homepage with hero, search, browse
- [x] Listing detail page with gallery
- [x] Booking flow UI (no backend)
- [x] Partner dashboard UI skeleton
- [x] Contact form (EmailJS)
- [ ] Fix dark mode (theme system loads only one palette)
- [x] Fix language toggle (FR/EN button is decorative only) — full FR/EN done 2026-06-13
- [ ] Fix: `FavoritesContext` dead code (Zustand is primary, remove the context file)
- [ ] Refactor category types to new 6-category structure

---

### Phase 1 — Database & Backend Foundation
**Goal:** Connect real data. Bookings actually submit. Partners can add listings.

- [ ] Create Supabase project
- [ ] Install Drizzle ORM + `drizzle-kit`
- [ ] Write database schema (Drizzle schema files in `src/db/schema/`)
- [ ] Run initial migration on Supabase
- [ ] Create server actions / API routes:
  - `POST /api/bookings` — create a booking
  - `GET /api/listings` — paginated listings
  - `POST /api/listings` — partner creates a listing
  - `PUT /api/listings/[id]` — partner edits listing
  - `POST /api/reviews` — submit a review
- [ ] Sync Clerk user webhooks → Supabase `users` table
- [ ] Migrate mock data → real Supabase rows
- [ ] Move favorites from localStorage → Supabase (keep localStorage as fallback for guests)

---

### Phase 2 — Category 1: Accommodation (Hotels, Guesthouses, Villas)
**Why first:** Highest booking value, most similar to Booking.com (well-understood UX)

**Specific features:**
- [ ] Check-in / check-out date range picker with availability calendar
- [ ] Room type selector (Standard, Deluxe, Suite)
- [ ] Price per night × nights calculation
- [ ] Breakfast included toggle
- [ ] Real-time availability (blocked dates from Supabase)
- [ ] Booking confirmation email (Resend API or EmailJS template)
- [ ] Partner dashboard: manage room types, set availability, view incoming bookings
- [ ] City-level SEO pages: `/accommodation/yaounde`, `/accommodation/douala`

**Data fields specific to Accommodation:**
```typescript
{
  room_types: { name, price_xaf, max_guests, quantity }[]
  checkin_time: string       // "14:00"
  checkout_time: string      // "11:00"
  breakfast_included: boolean
  breakfast_price_xaf?: number
  cancellation_policy: "free" | "partial" | "strict"
  min_nights: number
}
```

---

### Phase 3 — Category 2: Food & Drinks (Restaurants, Snack Bars, Cafés)
**Why second:** High frequency bookings (daily), table reservation is simple

**Specific features:**
- [ ] Table reservation (date + time + party size)
- [ ] Menu/dishes showcase (photo, name, price — no ordering, just display)
- [ ] Opening hours display + "Open Now" badge
- [ ] Cuisine type filter (Cameroonian, Continental, Asian, Fast Food)
- [ ] "Has delivery?" filter
- [ ] Reservation confirmation via WhatsApp message to business
- [ ] Partner dashboard: manage menu, set table availability, view reservations

**Data fields specific to Food & Drinks:**
```typescript
{
  cuisine_types: string[]
  opening_hours: { day: string, open: string, close: string }[]
  table_capacity: number
  has_delivery: boolean
  has_takeaway: boolean
  has_outdoor_seating: boolean
  average_price_per_person_xaf: number
  menu_highlights?: { name, price, photo }[]
}
```

---

### Phase 4 — Category 3: Events & Venues (Halls, Theatres, Stadiums)
**Why third:** High revenue per booking, clear use case (weddings, conferences)

**Specific features:**
- [ ] Venue capacity selector
- [ ] Event type filter (Wedding, Conference, Concert, Exhibition, Birthday)
- [ ] Date availability calendar (full-day blocks, not hours)
- [ ] Equipment checklist (PA system, projector, catering, decoration)
- [ ] Package pricing (Basic, Standard, Premium)
- [ ] Inquiry form → quote request (not instant booking)
- [ ] Partner dashboard: manage event calendar, respond to inquiries

**Data fields specific to Events & Venues:**
```typescript
{
  max_capacity: number
  venue_types: string[]           // ["wedding", "conference", "concert"]
  equipment_available: string[]
  has_catering: boolean
  has_decoration_service: boolean
  indoor_outdoor: "indoor" | "outdoor" | "both"
  packages?: { name, price_xaf, includes: string[] }[]
  minimum_booking_hours: number
}
```

---

### Phase 5 — Category 4: Nightlife (Clubs, Lounges, Bars)
**Why fourth:** Table/VIP reservation model, unique Cameroon nightlife scene

**Specific features:**
- [ ] VIP table reservation (table type, minimum spend)
- [ ] Guest list / pre-entry booking
- [ ] Event nights calendar (themed nights, DJs, artists)
- [ ] Dress code display
- [ ] Age restriction display (18+/21+)
- [ ] Cover charge display
- [ ] Partner dashboard: manage event nights, table inventory, guest list

**Data fields specific to Nightlife:**
```typescript
{
  dress_code?: string
  age_restriction: number         // 18 or 21
  cover_charge_xaf?: number
  vip_table_minimum_xaf?: number
  vip_table_types?: { name, capacity, min_spend_xaf }[]
  event_nights?: { date, name, artists: string[], cover_xaf }[]
  opening_hours: { day, open, close }[]
}
```

---

### Phase 6 — Category 5: Beauty & Wellness (Salons, Spas, Barbershops)
**Why fifth:** Appointment-based, different booking model than others

**Specific features:**
- [ ] Service menu with pricing and duration (Haircut: 30min, 5,000 XAF)
- [ ] Staff/stylist selection
- [ ] Appointment time slot picker
- [ ] Appointment reminder (WhatsApp or SMS)
- [ ] Walk-in availability badge
- [ ] Partner dashboard: manage staff, services, appointment calendar

**Data fields specific to Beauty & Wellness:**
```typescript
{
  services: { name, price_xaf, duration_min, category }[]
  staff?: { name, photo, specialization }[]
  walk_in_available: boolean
  appointment_required: boolean
  gender_specialization: "unisex" | "men" | "women"
  brands_used?: string[]
}
```

---

### Phase 7 — Category 6: Transport & More (Car Hire, Tours, Clinics)
**Why last:** Most diverse/complex, clinics are a different model entirely

**Sub-phases:**
- **7a. Car Hire** — vehicle catalog, rental dates, driver option, pick-up location
- **7b. Tour Operators** — tour packages, itinerary display, group booking
- **7c. Clinics** — appointment booking, doctor selection, specialty filter

**Data fields specific to Transport:**
```typescript
{
  // Car hire
  vehicles?: { make, model, year, seats, price_per_day_xaf, has_driver }[]
  min_rental_days: number
  pickup_locations?: string[]
  
  // Tours
  tours?: { name, duration, price_xaf, max_group, itinerary: string[] }[]
  
  // Clinics
  specialties?: string[]
  doctors?: { name, specialty, available_days: string[] }[]
  consultation_fee_xaf?: number
}
```

---

### Phase 8 — Cameroonian Competitive Features
**Goal:** These are features foreign platforms can't/won't build — this is where we win

- [ ] **Campay integration** — MTN MoMo + Orange Money real payments
- [ ] **WhatsApp booking** — "Book via WhatsApp" deep link with pre-filled message
- [ ] **WhatsApp notifications** — booking confirmations sent via WhatsApp to user + business
- [x] **FR/EN bilingual** — built with custom LanguageContext (not next-intl). French primary, English secondary. ALL pages translated as of 2026-06-13.
- [ ] **Neighborhood filtering** — Bastos, Akwa, Makepe, Bonanjo, Omnisports, etc.
- [ ] **Verification badge system** — ID-verified businesses get "Reserve237 Verified" badge
- [ ] **Offline/low-bandwidth mode** — ISR + static export for slow connections
- [ ] **XAF-native** — all pricing in FCFA, no conversion theatre
- [ ] **Local event calendar** — "Book for Fête Nationale", "Valentine's deals", "CHAN packages"
- [ ] **SMS fallback** — booking confirmations via Twilio SMS for users without WhatsApp

---

### Phase 9 — SEO & Growth
- [ ] Static generation for city + category pages (`/yaounde/restaurants`, `/douala/hotels`)
- [ ] Schema.org structured data for listings (Google rich snippets)
- [ ] Sitemap generation
- [ ] Local SEO (Google My Business equivalent)
- [ ] Social sharing cards (Open Graph images per listing)
- [ ] Referral program for business partners

---

## Current State of Key Files

| File | Status | Notes |
|---|---|---|
| `src/data/listings.ts` | ✅ Complete | 16 mock listings, 5 collections, helper functions |
| `src/stores/index.ts` | ✅ Complete | CategoryStore, BrowseStore, FavoritesStore |
| `src/app/page.tsx` | ✅ Complete | Hero + search + browse + collections |
| `src/app/listing/[slug]/page.tsx` | ✅ Complete | Gallery, amenities, reviews, booking CTA |
| `src/app/listing/[slug]/book/page.tsx` | ✅ UI only | No backend submission |
| `src/app/favorites/page.tsx` | ✅ Complete | Zustand-powered, persisted |
| `src/app/dashboard/page.tsx` | ✅ UI only | Stats/charts all mock data |
| `src/app/dashboard/listings/page.tsx` | ⚠️ Placeholder | "Coming soon" stub |
| `src/app/dashboard/reservations/page.tsx` | ⚠️ Placeholder | "Coming soon" stub |
| `src/app/dashboard/availability/page.tsx` | ⚠️ Placeholder | Unread |
| `src/app/dashboard/settings/page.tsx` | ⚠️ Placeholder | Unread |
| `src/app/contact/page.tsx` | ✅ Complete | EmailJS working |
| `src/app/business/page.tsx` | ✅ Complete | Partner onboarding |
| `src/components/homepage/NewNavbar.tsx` | ✅ Complete | Clerk integrated |
| `src/components/booking/BookingPage.tsx` | ✅ UI only | No backend |
| `src/components/theme-provider.tsx` | ⚠️ Broken | All 4 themes use same palette |
| `src/components/favorites-context.tsx` | 🗑️ Dead code | Remove — Zustand is primary |
| `.env.local` | ✅ Configured | Clerk + EmailJS keys present |

---

## Known Issues (to fix)

1. **Theme system broken** — `theme-provider.tsx` defines 4 themes but all reference same `reservePalette` object. Dark mode doesn't actually change colors.
2. ~~**Language toggle is UI-only**~~ — FIXED 2026-06-13. Full FR/EN translation across every page of the platform.
3. **Dead code** — `src/components/favorites-context.tsx` defines `FavoritesProvider` that is never used anywhere. Should be deleted.
4. **Recharts imported but unused** — `recharts` is in package.json and imported somewhere but no chart components are rendered yet.
5. **Booking form doesn't submit** — Full UI exists but `handleSubmit` in `BookingPage.tsx` just shows a modal with no API call.
6. **Dashboard pages are stubs** — `listings`, `reservations`, `availability`, `settings` under `/dashboard/` are all placeholder "coming soon" pages.

---

## Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# EmailJS (Contact Form)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_gsg0k7u
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_87jrdke
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=Lkj_qckJAH5pTrqvk

# --- TO BE ADDED ---
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Campay (MTN MoMo + Orange Money)
CAMPAY_USERNAME=
CAMPAY_PASSWORD=
CAMPAY_APP_TOKEN=

# Resend (Transactional Email)
RESEND_API_KEY=

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## Cameroonian Cities & Neighborhoods Reference

**Cities in scope:**
- **Yaoundé** (capital, political hub) — neighborhoods: Bastos, Mvan, Omnisports, Nlongkak, Centre Ville, Mvog-Mbi
- **Douala** (economic capital, largest city) — neighborhoods: Akwa, Bonanjo, Makepe, Bonapriso, Deido, Logpom
- **Limbe** (coastal, tourism) — neighborhoods: Down Beach, Mile 4, Bota
- **Bafoussam** (western region) — neighborhoods: Kamkop, Centre
- **Bamenda** (north-west, anglophone) — neighborhoods: Commercial Avenue, Up Station

**Future cities:** Kribi, Garoua, Maroua, Ngaoundéré

---

## Payments Reference

**Campay API** (recommended payment gateway for Cameroon):
- Website: campay.net
- Aggregates: MTN Mobile Money + Orange Money
- REST API with webhooks
- Test mode available
- Commission: ~1.5-3% per transaction
- Payout: Bank transfer or Mobile Money

**Payment flow:**
1. User selects MTN MoMo or Orange Money at checkout
2. User enters phone number
3. Backend calls Campay API → initiates USSD push
4. User approves on their phone
5. Campay webhook fires → update booking status to `confirmed`
6. Send WhatsApp confirmation to user + business

---

## Build Log

### 2026-05-31 — Session 1: Project Audit + Planning
- Completed full codebase audit (see audit summary above)
- Chose Supabase + Drizzle ORM as database stack
- Defined 6 category structure from product diagram
- Created this NOTES.md
- Next action: Begin Phase 1 — Set up Supabase project and Drizzle ORM schema

### 2026-05-31 — Session 2: Phase 1 — Database & Schema Setup
**Packages installed:**
- `drizzle-orm@0.45.2` — ORM
- `postgres@3.4.9` — PostgreSQL driver (required by Drizzle for Supabase)
- `@supabase/supabase-js@2.106.2` — Supabase client (Storage + Realtime)
- `drizzle-kit@0.31.10` (devDep) — CLI for migrations and studio

**Files created:**
- `src/db/schema/users.ts` — users table (Clerk ID as PK, role: customer/partner/admin)
- `src/db/schema/businesses.ts` — partner business profiles
- `src/db/schema/listings.ts` — all listings (mainCategory + subCategory + JSONB details)
- `src/db/schema/listing-images.ts` — listing photo gallery
- `src/db/schema/listing-amenities.ts` — amenity tags per listing
- `src/db/schema/bookings.ts` — all reservations (supports date-range + single-date models)
- `src/db/schema/reviews.ts` — reviews linked to bookings (verified reviews only)
- `src/db/schema/favorites.ts` — server-side favorites (complement to localStorage)
- `src/db/schema/availability.ts` — blocked dates per listing
- `src/db/schema/index.ts` — barrel export of all schema
- `src/db/index.ts` — Drizzle client (postgres driver, `prepare:false` for Supabase pooler)
- `src/lib/supabase.ts` — Supabase browser + admin clients
- `drizzle.config.ts` — Drizzle Kit config (uses unpooled URL for migrations)

**package.json scripts added:**
- `db:generate` — generates SQL migration files
- `db:push` — pushes schema directly to DB (use in dev)
- `db:migrate` — runs migration files
- `db:studio` — opens visual DB browser

**Next action:** User must create Supabase project and fill in `.env.local` vars, then run `npm run db:push` to create all tables.

**Resolution:** `db:push` had silent issues (bracket-wrapped password in connection strings, drizzle-kit not pushing to empty DB). Fixed by running generated SQL directly in Supabase SQL Editor. All 9 tables confirmed live in Supabase Table Editor.

**Status: COMPLETE ✅** — Database is live at `vujaawuzgxfdmxvnrolx.supabase.co`

### 2026-05-31 — Session 3: Phase 2 — Server Actions, Seed, Booking Form

**Files created:**
- `src/actions/bookings.ts` — `createBooking` server action (looks up listing by slug, inserts to `bookings` table, returns `{ success, bookingId }`)
- `src/actions/listings.ts` — `getListingBySlug`, `getListings` server actions
- `src/db/seed.ts` — seeds all 16 mock listings + images + amenities to Supabase

**Files modified:**
- `src/components/booking/BookingPage.tsx` — `handleSubmit` now calls `createBooking` server action; added `submitting` state, error display, `userId` prop
- `src/app/listing/[slug]/book/page.tsx` — converted to async server component; passes Clerk `userId` to `BookingPage`
- `package.json` — added `db:seed` script (`tsx src/db/seed.ts`)

**Seed result:** All 16 listings seeded successfully with images and amenities

**Storage buckets (CREATED ✅):**
- `listings` (public, 10MB limit) — listing photos uploaded by partners
- `avatars` (public, 5MB limit) — user and business profile photos

**What works now:**
- Booking form submits real data to Supabase `bookings` table
- Bookings are linked to real listing UUIDs via slug lookup
- Logged-in users have their Clerk ID saved on the booking
- Guest checkout (no login required) works too

**Partner dashboard listings page (COMPLETE ✅):**
- `src/actions/businesses.ts` — `getOrCreateBusiness` (auto-creates business on first listing)
- `src/actions/listings.ts` — full CRUD: `createListing`, `updateListing`, `deleteListing`, `toggleListingActive`, `getPartnerListings`
- `src/app/dashboard/listings/page.tsx` — server component, fetches partner listings
- `src/components/dashboard/ListingsManager.tsx` — full client component:
  - Listings grid with category badges, city, price, active status
  - Slide-in drawer for create/edit form (14 fields)
  - Photo upload (up to 5, preview, cover badge) → uploaded to Supabase Storage `listings` bucket
  - Active/Inactive toggle per listing
  - Delete confirmation dialog
  - Optimistic UI updates

**Next actions:**
- Dashboard reservations page (view incoming bookings per listing)
- Fix dark mode theme system
- Add FR/EN language toggle (next-intl)

### 2026-06-01 — Session 4: Auth Audit + Full Auth Flow Fix

**Audit findings:**
- No `middleware.ts` existed → dashboard was publicly accessible without login
- No forgot password on either sign-in page
- Logout button in DashboardLayout was not wired to Clerk
- Dashboard overview was 100% mock data (hardcoded bookings, stats, user name)
- Business sign-in had a hidden invisible link (opacity-0) — security smell, replaced

**Files created:**
- `middleware.ts` (root) — Clerk middleware protecting `/dashboard/*`. Unauthenticated users are redirected to sign-in automatically.
- `src/app/forgot-password/page.tsx` — Full 2-step forgot password page:
  - Step 1: Enter email → Clerk sends 6-digit reset code via email
  - Step 2: Enter code + new password + confirm → password reset + auto sign-in
  - Works for both customers (`/forgot-password`) and business partners (`/forgot-password?type=business`)
  - After reset: customers → `/`, business partners → `/dashboard`
- `src/actions/dashboard.ts` — `getDashboardStats(userId)` server action:
  - Queries real bookings from DB for partner's listings
  - Returns: totalListings, activeListings, todayBookings, pendingBookings, totalRevenueXaf, recentBookings[]
- `src/components/dashboard/DashboardOverview.tsx` — Full dashboard UI as client component:
  - Accepts real `firstName` (from Clerk) and `stats` (from DB) as props
  - Stat cards show real data: today's bookings, total revenue, listing count, pending count
  - Recent bookings list shows real DB records with guest name, listing name, date, status, amount
  - Calendar is real (shows current month, highlights today's date)
  - Greeting uses real time of day ("Good morning/afternoon/evening, [firstName]")
  - Pending bookings badge on sidebar nav item
  - Logout button wired to Clerk `signOut`

**Files modified:**
- `src/app/dashboard/page.tsx` — Converted from "use client" mock component to async server component. Fetches `currentUser()` + `getDashboardStats()` in parallel, passes real data down.
- `src/app/sign-in/[[...sign-in]]/page.tsx` — Added "Forgot password?" link above password field → `/forgot-password`
- `src/app/business/sign-in/[[...sign-in]]/page.tsx` — Added "Forgot password?" link → `/forgot-password?type=business`. Fixed hidden invisible link (was `opacity-0`, now "Are you a customer? Sign in here")
- `src/components/dashboard/DashboardLayout.tsx` — Wired logout button to Clerk `signOut({ redirectUrl: '/' })`. Added `useClerk` import to `DashboardSidebar` (not wrapper).

**TypeScript:** 0 errors after fixes. (Tailwind linting warnings are style suggestions only — whole codebase uses `var(--)` consistently.)

**Auth flow now complete:**
```
Customer:
  /sign-in → email+password → redirect /
  /sign-up → Clerk component → redirect /
  /forgot-password → email code → new password → redirect /

Business partner:
  /business/sign-in → email+password → redirect /dashboard
  /business/sign-up → 3-step (info + credentials + verify) → redirect /dashboard
  /forgot-password?type=business → email code → new password → redirect /dashboard

Route protection:
  /dashboard/* → middleware.ts enforces auth → unauthenticated → redirect /sign-in
```

**Next actions:**
- Dashboard reservations page (real bookings list with status management)
- Fix dark mode (all 4 themes currently use same palette)
- FR/EN bilingual with next-intl

### 2026-06-01 — Session 5: Business Onboarding Redesign

**Decision:** Category-first 4-step wizard (like Airbnb for hosts). Location uses City + Neighbourhood + Landmark for Cameroonian discoverability.

**Database changes (run manually in Supabase SQL Editor):**
```sql
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS main_category text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS landmark text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS tiktok text,
  ADD COLUMN IF NOT EXISTS youtube text,
  ADD COLUMN IF NOT EXISTS twitter text;
```

**Files modified:**
- `src/db/schema/businesses.ts` — Added: mainCategory, city, neighborhood, landmark, instagram, facebook, tiktok, youtube, twitter
- `src/actions/businesses.ts` — Full rewrite with 4 actions:
  - `getOrCreateBusiness(userId)` — auto-create on first listing (unchanged)
  - `setupBusinessProfile(input)` — NEW: called after email verification on sign-up. Upserts user record (FK fix), creates business with all sign-up data. DB-connected.
  - `updateBusinessProfile(input)` — NEW: for Settings page. Updates all fields including social links.
  - `getBusinessProfile(userId)` — NEW: for Settings page. Returns full business record.
- `src/app/business/sign-up/[[...sign-up]]/page.tsx` — Complete rewrite, 4-step wizard:
  - **Step 1:** 6 visual category cards (Food & Drinks, Nightlife, Beauty & Wellness, Events & Venues, Accommodation, Transport & More). Color-coded, icon + description. Selected state with checkmark.
  - **Step 2:** Business name + City dropdown + Neighbourhood dropdown (dynamic per city) + Landmark free-text ("En face Total Bonapriso") + optional description
  - **Step 3:** Email + Password + Confirm password + Terms note
  - **Step 4:** 6-digit email verification code + resend button
  - After verification: calls `setupBusinessProfile()` → saves everything to DB → redirects to `/dashboard`
  - Animated step transitions (slide in/out)
  - Progress bar at top + step pills
  - Fix: `useSignUp() as any` cast (Clerk v7.3.5 TypeScript `SignUpSignalValue` type issue)
- `src/app/forgot-password/page.tsx` — Wrapped in `<Suspense>` to fix `useSearchParams()` Next.js build error

**Build result:** ✅ All pages compiled. `next build` passes with `NODE_OPTIONS=--max-old-space-size=4096`

**Neighbourhood data per city:**
- Yaoundé: Bastos, Mvan, Omnisports, Nlongkak, Centre Ville, Mvog-Mbi, Biyem-Assi, Nsimeyong, Odza, Emana
- Douala: Akwa, Bonanjo, Makepe, Bonapriso, Deido, Logpom, Bali, Ndogbong, Bonaberi, Kotto
- Limbe, Bafoussam, Bamenda, Kribi — each with 3–5 neighbourhoods

**Social links supported:** Instagram, Facebook, TikTok, YouTube, Twitter/X (+ website already existed)

**Next actions (business backend remaining):**
- Dashboard reservations page — confirm/reject bookings ✅ Done below
- Settings page — edit business profile + social links + change password + delete account
- Availability calendar — block/unblock dates per listing

### 2026-06-01 — Session 6: B2 — Reservations Page

**Files created:**
- `src/components/dashboard/ReservationsManager.tsx` — Full client component:
  - Filter tabs: All / Pending / Cancelled / Confirmed / Completed (with live counts + gold badge on Pending)
  - Search bar — filters by guest name, email, phone, listing name
  - Booking cards — collapsible (click to expand full detail)
  - Expanded view shows: guest contact (phone + email), booking details (listing, guests, dates), payment breakdown (amount, service fee, payment method, payment status), guest notes, booking ID + timestamp
  - Action buttons per status:
    - Pending → [Reject] [Confirm booking]
    - Confirmed → [Cancel] [Mark as completed]
    - Cancelled / Completed → "No further actions"
  - Optimistic UI: status updates instantly in UI, then syncs to DB
  - Empty states per tab

**Files modified:**
- `src/actions/bookings.ts` — Added:
  - `getPartnerBookings(userId, filters?)` — queries all bookings for partner's listings via JOIN, with optional status filter and search (name/email/phone)
  - `updateBookingStatus(bookingId, userId, status)` — confirms ownership via business chain before updating. Supports: confirmed, cancelled, completed
- `src/app/dashboard/reservations/page.tsx` — Replaced stub with server component that fetches real bookings and passes to `ReservationsManager`

**What's now real (DB-connected):**
- Partner sees all bookings for all their listings
- Can filter by status and search
- Confirm → status = 'confirmed'
- Reject → status = 'cancelled'
- Complete → status = 'completed'
- Cancel a confirmed booking → status = 'cancelled'
- All changes persist to Supabase `bookings` table

**Next actions:**
- B3: Settings page ✅ Done below
- B4: Availability calendar
- B5: Dashboard chart real data

### 2026-06-01 — Session 7: B3 — Settings Page

**Files created:**
- `src/actions/account.ts` — `deleteBusinessAccount(userId)`:
  - Deletes in correct FK order: bookings first (no cascade) → listings (cascades images/amenities/reviews/favorites/availability) → business → user record
- `src/components/dashboard/SettingsManager.tsx` — Full client component with 4 tabs:
  - **Business profile tab**: name, description, city (dropdown), neighbourhood (dynamic dropdown), landmark, phone, WhatsApp, business email, website. Calls `updateBusinessProfile()`.
  - **Social media tab**: Instagram, Facebook, TikTok, YouTube, Twitter/X (all URL inputs with icons). Calls `updateBusinessProfile()`.
  - **Security tab**: displays signed-in email + name (read-only from Clerk). Change password form (current → new → confirm) via Clerk `user.updatePassword()`.
  - **Danger zone tab**: Delete account button → confirmation modal requiring user to type "DELETE" → calls `deleteBusinessAccount()` (DB cleanup) then Clerk `user.delete()` → redirects to `/`.
  - All sections have success/error feedback banners.
  - All saves are real DB writes via server actions.

**Files modified:**
- `src/app/dashboard/settings/page.tsx` — Replaced stub. Server component fetches `getBusinessProfile(userId)` + `currentUser()` in parallel, passes to `<SettingsManager>`.

**What partners can now do in Settings:**
- ✅ Edit business name, description, city, neighbourhood, landmark
- ✅ Edit phone, WhatsApp, business email, website
- ✅ Add/update social links (Instagram, Facebook, TikTok, YouTube, Twitter/X)
- ✅ Change password (Clerk-managed)
- ✅ Delete entire account (DB + Clerk, irreversible, requires typing DELETE)
- ✅ Already had logout ✅

**Build note:** `next build` requires `NODE_OPTIONS=--max-old-space-size=4096` on this machine to avoid OOM crash during TypeScript checking.

**Next actions:**
- B4: Availability calendar ✅ Done below
- B5: Dashboard chart real data (7-day bookings per day)

### 2026-06-01 — Session 8: B4 — Availability Calendar

**Files created:**
- `src/actions/availability.ts` — 5 server actions:
  - `getListingAvailability(listingId)` — returns array of blocked date strings
  - `getBookedDates(listingId)` — returns dates with pending/confirmed bookings (including date-range expansion for accommodation)
  - `toggleDateBlocked(listingId, userId, date)` — clicks toggle: inserts row if not blocked, deletes if blocked. Ownership verified.
  - `blockDateRange(listingId, userId, start, end, reason?)` — inserts all dates in range not already blocked
  - `unblockDateRange(listingId, userId, start, end)` — deletes all blocked dates in range
- `src/components/dashboard/AvailabilityManager.tsx` — Full calendar client component:
  - Listing selector (dropdown, auto-loads availability on change via `useTransition`)
  - Month navigation (← prev / next →)
  - Calendar grid with 4 date states:
    - Available: default, hover shows green tint, click to block
    - Blocked: red background + line-through, click to unblock
    - Booked: teal background + dot indicator, not clickable
    - Today: gold background (also shows block/booked state)
    - Past: grayed out, not interactive
  - Monthly stats sidebar: days in month, blocked count, booked count
  - Range block/unblock tool: date picker pair + Block Range / Unblock Range toggle
  - Legend strip (Available, Blocked, Booked, Today)

### 2026-06-13 — Session 9: Dashboard polish + Listing videos

**Dashboard polish:**
- Removed dead "⋯" button on booking rows (Overview)
- "Withdraw via MoMo" marked Bientôt/coming-soon (disabled, badge)
- Revenue stat recalculated net of `bookings.serviceFeeXaf` and renamed to "Net Earnings" / "Gains nets"
- New `getPendingBookingsSummary(userId)` in `src/actions/dashboard.ts` — powers a sidebar badge on "Bookings" and a topbar bell dropdown (`DashboardShell.tsx`)
- "+ New listing" now links to `/dashboard/listings?new=1`, which auto-opens the create drawer (`ListingsManager.tsx` useEffect on `searchParams`)
- `setupBusinessProfile` now also creates the partner's first `listings` row pre-filled from the sign-up wizard (name, category, city, neighborhood, landmark, phone, whatsapp, description)

**Listing videos feature (NEW):**
- `src/db/schema/listing-videos.ts` — new `listing_videos` table (id, listingId FK cascade, url, durationSeconds, order, createdAt)
- `src/lib/videoLimits.ts` — `VIDEO_LIMITS` per plan: free = 1 video / 30s, basic = 3 videos / 60s, premium = 6 videos / 120s. `MAX_VIDEO_FILE_SIZE_MB = 50`.
- `src/actions/listing-videos.ts` — `getListingVideos`, `uploadListingVideo` (ownership + plan + count + duration + size checks), `deleteListingVideo`
- `ListingsManager.tsx` — new `VideoManager` component in the edit drawer (edit mode only — videos require a saved listing ID). Client-side duration check via a hidden `<video>` element's `loadedmetadata` event.
- `getPublicListingBySlug` now returns `videos: { url, durationSeconds }[]`; `ListingDetailContent.tsx` renders them in a horizontally-scrolling row with native `<video controls>`.
- New translation keys: `lm_videos`, `lm_add_video`, `lm_video_max_suffix`, `lm_video_save_first`, `lm_video_too_large`, `lm_video_too_long`, `lv_videos` (FR + EN).

**DB migration generated but NOT applied:** `src/db/migrations/0001_noisy_polaris.sql` — creates `listing_videos` table + FK, and also includes previously-pending `businesses` columns (mainCategory, city, neighborhood, landmark, instagram, facebook, tiktok, youtube, twitter) that were added to the schema in earlier sessions but never migrated. **Action required:** run this SQL in the Supabase SQL Editor (same workaround as before — `db:push` is broken in this sandbox).

**Storage bucket required (NOT YET CREATED):** `listing-videos` — needs to be created manually via Supabase dashboard, same as `listings`/`avatars` buckets. Recommended: public, ~50MB file size limit, allowed MIME types `video/mp4,video/webm,video/quicktime`.
  - Feedback banner for range operations
  - Info box explaining blocked vs booked behavior

**Files modified:**
- `src/app/dashboard/availability/page.tsx` — Replaced stub with server component that pre-loads first listing's availability + booked dates.

**What partners can now do:**
- ✅ See which dates are blocked, booked, or available in a calendar view
- ✅ Click any future date to block it (prevents customer bookings)
- ✅ Click a blocked date to unblock it
- ✅ Use range tool to block/unblock multiple dates at once (e.g. holiday closure)
- ✅ Switch between listings — calendar reloads automatically
- ✅ Cannot accidentally change dates that have real bookings

**Next action:**
- B5: Dashboard chart ✅ Done below

### 2026-06-01 — Session 9: B5 — Dashboard Chart Real Data

**Files modified:**
- `src/actions/dashboard.ts` — Added `WeekDay` interface + `weeklyData: WeekDay[]` to `DashboardStats`. After fetching all bookings, builds a 7-day map (today - 6 → today), groups bookings by `createdAt` date, computes heights as % of busiest day. Empty state returns 7 zero-height days with correct day names.
- `src/components/dashboard/DashboardOverview.tsx` — Replaced hardcoded `WEEK` constant with `stats.weeklyData`. Chart now shows:
  - Real bar heights (relative to busiest day in the last 7 days)
  - Hover tooltips per bar ("X bookings")
  - Real total count below heading (sum of 7-day bookings)
  - Day labels under bars (Mon, Tue, etc.)
  - Zero-booking days show as a thin line (not invisible)

**Business backend — ALL COMPLETE ✅**

| Phase | Feature | Status |
|---|---|---|
| B1 | Sign-up → DB sync (category-first wizard) | ✅ |
| B2 | Reservations page (confirm/reject/complete) | ✅ |
| B3 | Settings (profile, social, password, delete) | ✅ |
| B4 | Availability calendar (block/unblock dates + range) | ✅ |
| B5 | Dashboard chart real data (7-day view) | ✅ |

**Next: User-side frontend (home, search, listing detail, booking, favorites)**

### 2026-06-01 — Session 13: U1 — Connect user side to real DB

**What changed:** Every customer-facing page now reads from Supabase instead of the mock `allListings` array.

**New files:**
- `src/types/listing.ts` — `PublicListing` interface (shared type for all customer pages)
- `src/components/listing/ListingDetailContent.tsx` — extracted client component for listing detail page (interactive: lightbox, favorites, WhatsApp CTA)

**Modified files:**
- `src/actions/listings.ts` — Added `getPublicListings()` and `getPublicListingBySlug()` returning `PublicListing[]`. 3-query pattern: listings + primary images (batched) + amenities (batched). Includes fallback image.
- `src/lib/categoryColors.ts` — Completely rewritten for 6 new main categories (food-drinks, nightlife, beauty-wellness, events-venues, accommodation, transport-more). New icons, colors, labels. Added `ALL_MAIN_CATEGORIES` constant.
- `src/stores/index.ts` — Updated `BrowseStore` to use `string | "all"` (not old enum), `FavoritesStore` to use `PublicListing` (bumped storage key to v3 to clear incompatible old favorites)
- `src/app/page.tsx` — Converted to async server component. Fetches real listings via `getPublicListings()`, passes to child components as props.
- `src/components/homepage/SearchFilterSection.tsx` — Now accepts `listings: PublicListing[]` prop. Filters client-side on real data. Updated search to include neighborhood. Category buttons now show all 6 main categories.
- `src/components/homepage/PremiumListingCard.tsx` — Uses `PublicListing`. Shows `mainCategory` label, DB amenities, `priceLabel`. Rating shows "New" when 0. Slug used directly from DB (no more `generateSlug(name)`).
- `src/components/homepage/ConditionalCuratedCollections.tsx` — Accepts `listings: PublicListing[]` prop.
- `src/components/homepage/CuratedCollections.tsx` — Builds collections dynamically from real DB listings (Top Picks, Best in Yaoundé, Best in Douala, Accommodation, Verified). Shows max 3 collections with ≥2 listings each.
- `src/app/listing/[slug]/page.tsx` — Converted to async server component. Fetches via `getPublicListingBySlug`. Renders `ListingDetailContent`.
- `src/app/listing/[slug]/book/page.tsx` — Fetches listing from DB via `getPublicListingBySlug`.
- `src/app/favorites/page.tsx` — Updated to use `PublicListing` fields (`mainCategory`, `priceLabel`, `slug` directly).

**U2 (WhatsApp button) done at the same time:** `ListingDetailContent.tsx` has a green WhatsApp CTA button that pre-fills a message in French: "Bonjour, je suis intéressé(e) par votre établissement '[name]' sur Reserve237..."

**Mock data file:** `src/data/listings.ts` still exists but is no longer used by any customer-facing page. Can be deleted later once partner data grows.

### 2026-06-01 — Session 14: U3 — Customer sign-up redesign

**File modified:** `src/app/sign-up/[[...sign-up]]/page.tsx` — Complete rewrite. Was just `<SignUp />` Clerk default component.

**New design:**
- Split layout: left panel (dark #1F2A2A) with brand + 4 benefits + MoMo logos (desktop only), right panel with form
- Step 1 form: First name*, Email*, Password*, Confirm password*, Phone (optional, "for booking confirmations")
- Step 2: Email verification (6-digit code, 60s resend cooldown, "wrong email? go back" escape)
- Terms + Privacy are real links (open in new tab)
- After verification: `setActive` → redirect to `/`
- Consistent with business sign-up patterns (`useSignUp() as any` for Clerk v7 types)
- Mobile: stacked layout with compact header + sign-in link

**Build:** ✅ Zero TypeScript errors. All 15 pages generating correctly.

### 2026-06-01 — Session 15: U4 — Customer profile + booking history

**New files:**
- `src/actions/user.ts` — `getUserBookings(userId)` — queries bookings joined with listings, ordered newest first. Returns `UserBooking[]`.
- `src/app/profile/page.tsx` — async server component. Auth guard → fetches Clerk user + their bookings → renders `ProfileContent`.
- `src/components/profile/ProfileContent.tsx` — full client component:
  - Profile card: avatar (initials), name, email, booking count, inline name editor (saves via Clerk `user.update()`)
  - Booking tabs: Upcoming | Past (counts in badges)
  - Booking cards: listing name (linked to detail page), booking ID, date/time, guests, payment method, total, status badge
  - Cancel button for pending/confirmed bookings → calls existing `updateBookingStatus` server action (ownership verified server-side)
  - Optimistic UI: booking status updates instantly in UI

**Modified:**
- `src/components/homepage/NewNavbar.tsx` — Signed-in customers now see "My Bookings → /profile" link. Partners still see "Dashboard". Works in both desktop and mobile menu.

**Route added:** `/profile` — auth-protected (redirects to /sign-in if not logged in). 16 pages total now.

**Next user tasks:**
- U5: Favorites sync ✅ Done below
- U6: Real reviews submission

### 2026-06-01 — Session 16: U5 — Favourites DB sync

**New files:**
- `src/actions/favorites.ts` — 4 server actions:
  - `getUserFavoriteIds(userId)` — returns listing IDs from the `favorites` table
  - `addFavoriteDB(userId, listingId)` — inserts with `onConflictDoNothing` (idempotent)
  - `removeFavoriteDB(userId, listingId)` — deletes from `favorites` table
  - `syncFavoritesToDB(userId, listingIds[])` — bulk insert for initial push (onConflict ignore)
- `src/components/FavoritesSync.tsx` — invisible client component (renders null). Mounted in root layout. Logic:
  1. On user login: fetches DB favourite IDs → finds any missing from localStorage → fetches full `PublicListing` for them → merges into Zustand store atomically via `setFavorites()`
  2. Also pushes any localStorage-only favourites up to DB on first login
  3. On every `favorites` state change: diffs against a ref of previous IDs → calls `addFavoriteDB` / `removeFavoriteDB` in background (fire-and-forget, no UI blocking)
  4. `loadingRef` prevents diff-sync from firing during the initial DB load (avoids feedback loop)

**Modified:**
- `src/actions/listings.ts` — Added `getListingsByIds(ids[])` — fetches `PublicListing[]` for specific UUIDs with batched images + amenities queries
- `src/stores/index.ts` — Added `setFavorites(listings)` to `FavoritesStore` for atomic batch set during DB load
- `src/app/layout.tsx` — Added `<FavoritesSync />` inside `<ThemeProvider>` (runs on every page)

**Behaviour per user type:**
- Guest (not logged in): favourites stay in localStorage only — no change to existing behaviour
- Logged in, first visit: DB favourites merged with localStorage → unified store
- Logged in, toggles a favourite: DB updated silently in background
- Logs out then back in on another device: their DB favourites are restored automatically

**Performance fixes (2026-06-02) — slow page loads:**
- Root cause: every page was making 3-6 fresh DB queries from Cameroon → Frankfurt (EU) on every click, causing 8+ second load times.
- `src/app/page.tsx` — replaced `force-dynamic` with `export const revalidate = 60` (ISR). Homepage now cached 60s; only 1 DB hit per minute.
- `src/app/listing/[slug]/page.tsx` — added `export const revalidate = 300` (5-minute ISR cache).
- `src/app/dashboard/page.tsx` — wrapped `getDashboardStats` with `unstable_cache` (30s per-user cache).
- `src/app/loading.tsx` — homepage skeleton (instant grey placeholder while listings load)
- `src/app/listing/[slug]/loading.tsx` — listing detail skeleton
- `src/app/dashboard/loading.tsx` — dashboard overview skeleton
- `src/app/dashboard/listings/loading.tsx` — listings page skeleton
- `src/app/dashboard/reservations/loading.tsx` — reservations skeleton
- `src/app/dashboard/availability/loading.tsx` — availability skeleton
- `src/app/dashboard/settings/loading.tsx` — settings skeleton
- `src/app/profile/loading.tsx` — profile skeleton
- Quick Actions wired up: Update photos/Edit profile/View bookings/Edit listing now link to real pages; Run promo/Withdraw show "Bientôt" badge (not built yet).

**Runtime fixes (2026-06-02):**
- `src/db/index.ts` — Added `idle_timeout: 10`, `max_lifetime: 300`, `connect_timeout: 30` to postgres client. Prevents ECONNRESET from Supabase closing idle connections.
- `src/components/homepage/PremiumListingCard.tsx` — Added `relative` to Link wrapper so Next.js `fill` Image has a positioned ancestor (fixes console warning).
- `src/components/FavoritesSync.tsx` — DB sync errors (ECONNRESET, etc.) now silent in production; only warns in dev. Fallback: localStorage stays intact.
- `src/app/page.tsx` — Added `export const dynamic = "force-dynamic"` so homepage always fetches fresh listings. New partner listings appear immediately on homepage without cache delay.

**Next:** U6 ✅ Done below

### 2026-06-01 — Session 17: U6 — Real reviews submission

**New files:**
- `src/actions/reviews.ts` — 3 server actions:
  - `getListingReviews(listingId)` — returns `PublicReview[]` ordered by date
  - `hasUserReviewedBooking(bookingId)` — checks if review already exists
  - `submitReview(input)` — validates booking ownership + status, prevents duplicates, inserts review, **recalculates listing rating + review count** atomically

**Modified files:**
- `src/actions/user.ts` — Added `listingId: string` and `hasReviewed: boolean` to `UserBooking`. `getUserBookings` now checks which bookings already have reviews in a single batch query.
- `src/app/listing/[slug]/page.tsx` — Fetches reviews alongside listing, passes as `reviews` prop to `ListingDetailContent`
- `src/components/listing/ListingDetailContent.tsx` — Replaced 4 hardcoded sample reviews with real DB reviews. Shows all reviews with rating stars, body text, business reply (if set), date. Empty state: "No reviews yet."
- `src/components/profile/ProfileContent.tsx` — Added `StarPicker` component (interactive 5-star selector), inline review form on past confirmed/completed bookings:
  - "Write a review" button appears on eligible past bookings
  - Form expands inline: star rating + optional text body + submit
  - On success: booking card shows "✓ Reviewed", optimistic UI
  - On error: inline error message
  - Validates: rating must be set, booking must belong to user, status must be confirmed/completed, no duplicate reviews per booking

**Review flow for a customer:**
1. Books a listing → booking created (pending)
2. Partner confirms → status = 'confirmed'
3. Customer visits, experience complete
4. Customer goes to /profile → Past bookings → "Write a review" button appears
5. Selects 1–5 stars + optional text → submits
6. Listing detail page now shows real review + updated star rating

**Business benefit:** Listing ratings are now live and update automatically when reviews are submitted. Partners will see their real ratings in the dashboard.

### 2026-06-01 — Session 10: Middleware fix

**Problem:** Clerk error "clerkMiddleware() was not run" on `/dashboard`. Root cause: this project uses `src/` directory, so Next.js requires middleware at `src/middleware.ts`, NOT `./middleware.ts` (root).

**Fix:**
- Moved `middleware.ts` from project root → `src/middleware.ts`
- Deleted `src/proxy.ts` (old conflicting middleware leftover from project scaffold)

**Rule for this project:** All source files live under `src/`. Middleware = `src/middleware.ts`. Never at the project root.

### 2026-06-01 — Session 11: Dashboard layout fix (navbar covering sub-pages)

**Problem:** The site `<NewNavbar />` was covering all dashboard sub-pages (Reservations, Listings, Availability, Settings) because `dashboard/layout.tsx` only added `<NewNavbar /> + {children}`. The overview page worked because `DashboardOverview` had its own full-screen layout with sidebar.

**Root cause:** Two conflicting layout systems — overview had its own embedded layout, sub-pages had none.

**Fix:** Unified dashboard shell architecture:
- Created `src/components/dashboard/DashboardShell.tsx` — client component with sidebar + topbar. Uses `usePathname()` for active nav state. No site navbar — it IS the full layout.
- Updated `src/app/dashboard/layout.tsx` — async server component, handles auth guard, fetches firstName, renders `<DashboardShell>`. Removed `<NewNavbar />`.
- Simplified `src/components/dashboard/DashboardOverview.tsx` — removed embedded layout (sidebar, topbar, outer wrapper). Now just returns content (stat cards, chart, bookings).
- Updated `src/app/dashboard/page.tsx` — removed redundant auth + currentUser calls (layout handles them).

**All dashboard pages now use the same shell** — sidebar, topbar, scrollable content area. Active nav item is highlighted automatically based on current route.

### 2026-06-13 — Session 18: Full-platform FR/EN translation + launch badge removal

**Goal:** Every page of the platform switches language with the navbar FR/EN toggle (previously only homepage, listing detail, booking, favorites, profile, and customer auth were translated). Also remove the "Now launching in Yaoundé & Douala" messaging.

**1. Launch badge removed:**
- `src/app/business/page.tsx` — "Now launching in Yaoundé & Douala" hero badge deleted. OpenGraph description changed from "across Yaoundé, Douala and Cameroon" to "across Cameroon".

**2. Translation keys added:**
- `src/lib/translations.ts` — ~350 new key pairs added to both `fr` and `en` objects. New sections: shared (continue/close/search/soon/guest/password errors), footer, business landing, contact, forgot password, business sign-in, business sign-up, privacy policy (full legal text), terms of service (full legal text), dashboard shell, dashboard overview, reservations manager, availability manager, listings manager, settings manager. TypeScript `as const` typing guarantees FR/EN key parity at compile time — a missing key in either language fails the build.

**3. Pages/components wired to `useLanguage()` (15 files):**
- `src/components/business/BusinessLanding.tsx` — NEW. The /business landing content as a client component (features, steps, pricing points are TranslationKey arrays). `src/app/business/page.tsx` is now a thin server component that keeps the SEO metadata and renders `<BusinessLanding />`.
- `src/app/business/sign-in/[[...sign-in]]/page.tsx` — all labels, buttons, error messages.
- `src/app/business/sign-up/[[...sign-up]]/page.tsx` — 4-step wizard fully translated: step pills, category cards (labels reuse `cat_*` keys + new sublabel keys), all field labels/placeholders, validation errors, verification step. `SUB_TYPES` restructured to `{ value, en, fr }` — 30 business sub-types have French labels (e.g. Wedding Hall → Salle de mariage, Car Hire → Location de voiture), selected via `lang`.
- `src/app/contact/page.tsx` — form labels, placeholders, errors, success modal.
- `src/app/forgot-password/page.tsx` — both steps + all error messages.
- `src/app/privacy/page.tsx` + `src/app/terms/page.tsx` — rewritten as client components rendering translated section keys (full legal text exists in both languages).
- `src/components/homepage/NewFooter.tsx` — column titles, links, tagline, copyright (footerLinks now TranslationKey arrays).
- `src/components/auth/AuthHeader.tsx` — now "use client", nav links use `nav_home`/`nav_for_business`.
- `src/components/dashboard/DashboardShell.tsx` — sidebar nav, page titles, greeting (Bonjour/Bon après-midi/Bonsoir), date locale (fr-FR/en-GB), "Partner" badge, sign out, "+ New listing".
- `src/components/dashboard/DashboardOverview.tsx` — onboarding checklist, stat cards, chart labels, recent bookings, quick actions ("Bientôt" now uses `soon_label`), revenue card, status badges, mini calendar (French day/month names).
- `src/components/dashboard/ReservationsManager.tsx` — tabs, search, booking cards, expanded detail, payment labels (Card/Cash translated via `paymentLabel()` helper; MoMo brand names unchanged), action buttons, empty states, date locale.
- `src/components/dashboard/AvailabilityManager.tsx` — calendar day labels (Di/Lu/Ma...), month name locale, cell tooltips, legend, monthly stats, range tool, feedback messages, info box.
- `src/components/dashboard/ListingsManager.tsx` — header, empty state, listing cards, full create/edit drawer (categories reuse `cat_*` keys, `SUB_CATEGORIES` now `{ value, en, fr }`, price ranges via `pr_*` keys), delete dialog.
- `src/components/dashboard/SettingsManager.tsx` — all 4 tabs (profile, social, security, danger zone), all feedback messages, delete-account modal.

**Patterns used:**
- Module-level constant arrays store `TranslationKey` values; components call `t(key)` at render.
- Subcomponents (StatusBadge, BookingRow, MiniCalendar, PhotoUpload, Bullet) call `useLanguage()` themselves.
- Date formatting: `toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", ...)`.
- Bilingual data lists (sub-types) use `{ value, en, fr }` objects picked by `lang` — kept out of the global key set.

**Verification:**
- `next build` → "Compiled successfully" + "Finished TypeScript" (run twice) — proves all keys type-check and FR/EN sets match.
- Build's final prerender of `/` failed with `CONNECT_TIMEOUT aws-1-eu-central-1.pooler.supabase.com:6543` — Supabase DB not responding (TCP port answers, Postgres handshake doesn't → project likely **paused in Supabase dashboard**). Unrelated to this session's changes; resume the project and re-run the build.
- Dev-server smoke test not possible this session: machine had only 1.4 GB free RAM and `next dev` crashed twice with OOM (Node heap + Turbopack allocator). Reminder: this machine needs `NODE_OPTIONS=--max-old-space-size=4096` and free memory for builds.

**Note:** `src/components/dashboard/DashboardLayout.tsx` is dead code (nothing imports it — DashboardShell replaced it in Session 11). Left untranslated; should be deleted in a cleanup pass along with `src/components/favorites-context.tsx`.

### 2026-07-14 — Session 19: Supabase restored + video infra complete

**Incident:** Supabase project was unreachable (DNS ENOTFOUND on `vujaawuzgxfdmxvnrolx.supabase.co`) — free-tier project had been paused since ~mid-June. User restored it via the Supabase dashboard.

**Verified after restore:**
- All 10 tables live, including `listing_videos` → migration `0001_noisy_polaris.sql` is applied (businesses has main_category/city/neighborhood/landmark + all social columns)
- Seed data intact: 16 listings, 65 images. businesses/users/bookings/reviews/favorites all at 0 — previous test accounts are gone, re-create test partner as needed.
- `next build` passes end-to-end: compiled, 0 TS errors, all 17 pages generated (previously failed at prerender of `/` with DB down)

**Done this session:**
- Created `listing-videos` storage bucket via admin API (public, 50MB limit, MIME `video/mp4,video/webm,video/quicktime`). All 3 buckets now exist: listings, avatars, listing-videos.
- **Video feature is now fully unblocked** — schema + bucket + code all in place. Needs an end-to-end manual test (upload from dashboard edit drawer → playback on listing page).

**Still open (from earlier audits):** Campay payments, dark mode decision (theme-provider is a no-op — recommend shipping light-only), `src/middleware.ts` → `src/proxy.ts` rename (Next 16 deprecation warning), dead code cleanup (favorites-context.tsx, DashboardLayout.tsx), accommodation vs transport category colors too similar.

### 2026-07-14 — Session 20: Dashboard redesign + video thumbnails

**Dashboard professional redesign (user-approved direction: dark sidebar + white cards, Inter everywhere):**
- `DashboardShell.tsx` — sidebar now dark `#1F2A2A` (the white+gold logo finally reads correctly), active nav = solid teal `#13695A` pill, gold reserved for badges. Topbar is white with the "+ New listing" CTA in teal. Content canvas `#F5F1EB`. All Playfair inline styles removed from the dashboard (Inter throughout; serif stays on the customer site).
- The `<main>` content area overrides CSS vars (`--card: #fff`, lighter `--border`, `--surface-1`, `--secondary`) so var()-based components (ListingsManager, its drawer, `.card` utility) render white cards automatically without touching each usage.
- `DashboardOverview.tsx` — white cards with soft shadow (shared `CARD` constant), teal stat icons/chart bars/calendar today-marker, taller chart (h-24). Pending badge text darkened to `#9C7A0A` for contrast on white.
- `ReservationsManager/AvailabilityManager/SettingsManager` — all hardcoded `bg-[#EDE4D9]` cards → white with soft shadow; Playfair removed.
- All 8 dashboard `loading.tsx` skeletons updated to match (white cards).

**Video thumbnails (posters):**
- `listing_videos.poster_url` column added — schema + `src/db/migrations/0002_video_posters.sql` + applied live to Supabase via script.
- `listing-videos` bucket updated to also allow `image/jpeg`/`image/webp` (posters live in `{slug}/posters/`).
- `ListingsManager.tsx` `VideoManager` — captures a JPEG frame (~1s in, max 640px wide, q0.82) via canvas at upload time; falls back gracefully to no poster if the codec can't be decoded client-side. Dashboard video thumbs now show the poster image instead of loading the video.
- `listing-videos.ts` action — uploads optional `poster` from FormData, stores/returns `posterUrl`, deletes poster file alongside video on delete.
- `ListingDetailContent.tsx` — `<video poster={...}>`; when a poster exists, `preload="none"` (zero video bytes until play — good for MTN/Orange data bundles).

### 2026-07-14 — Session 21: Sign-in fixes + verified mobile responsiveness

**Auth fixes:**
- `dashboard/layout.tsx` — partner role guard: checks `users.role` in DB (partner/admin), falls back to Clerk `unsafeMetadata.role` if no DB row. Customers hitting /dashboard are redirected to `/business/sign-in?error=customer-account`.
- `business/sign-in` — shows translated "customer account" banner on that error param (wrapped in Suspense for useSearchParams); Clerk errors no longer shown raw (always translated via `err_invalid_credentials`); added `name` + `autoComplete` attrs (email / current-password).
- `sign-in` (customer) — same: translated errors (they were hardcoded English), autoComplete attrs.
- New translation key: `bsi_customer_account_error` (fr/en).

**Mobile polish:**
- `NewNavbar` — bar `h-16` on phones (was h-24), logo `h-12` (was h-20); mobile menu offset adjusted.
- `AuthHeader` — logo `h-14` on phones.

**Mobile responsiveness — VERIFIED with real device emulation (CDP, 390×844, DPR 2):**
- Homepage, listing detail, booking, business sign-in, business landing, favorites: `scrollWidth === clientWidth === 390` on all — zero horizontal overflow, layouts stack correctly.
- Gotcha for future checks: plain `chrome --headless --window-size=390,...` is WRONG — headless Chrome clamps window width to 500px minimum. Must use CDP `Emulation.setDeviceMetricsOverride` (script: scratchpad mobile-shots.mjs pattern).

### 2026-07-15 — Session 22: Sign-up was dead — Clerk v7 signals migration + deploy

**Deployed to production:** Supabase restored → env vars imported to Vercel → live at https://reserve237-premium-bookings-in-came.vercel.app (note: Vercel truncated the domain — it's `-came`, not `-cameroon`; `NEXT_PUBLIC_APP_URL` on Vercel should be updated to match). GitHub remote moved to borgos-dev account.

**Critical bug found & fixed — BOTH sign-up pages were completely dead:**
- Root cause: Clerk v7's `useSignUp()` returns `{ signUp, errors, fetchStatus }` — NO `isLoaded`. Both pages guarded with `if (!isLoaded || !signUp) return;` → `isLoaded` was always `undefined` → every submit silently early-returned. No error, no network call, button did nothing.
- Migrated both sign-up pages to the signals contract (mirroring the working sign-in pages): `create()`/`verifications.sendEmailCode()`/`verifications.verifyEmailCode({code})` return `{ error }` (never throw); `finalize()` activates the session (replaces `setActive`); `signUp.createdUserId` read after finalize for `setupBusinessProfile`.
- Second blocker surfaced after that fix: "CAPTCHA failed to load" — Clerk bot protection needs a `<div id="clerk-captcha" />` mount in custom flows. Added to both sign-up forms (before submit button, `empty:hidden`).
- Verified live via CDP browser automation: form fills → submit → Turnstile "Verify you are human" widget renders correctly and gates account creation (automation stops there by design; human click proceeds).
- UI: password + confirm now side-by-side on sm+; `.input-field` slimmed (py-2.5, rounded-xl) — user found inputs too bulky.
- **Debug lesson:** Clerk sign-IN pages were already on the signals pattern and fine. If an auth button "does nothing" with zero console errors, check for stale `isLoaded` destructuring first.
- Test emails: `*+clerk_test@example.com` with code 424242 works on dev instances.

**New findings (not yet fixed):**
1. i18n gaps found in screenshots: homepage hero headline + subtitle + CategorySwitcher pills ("Dining & Nightlife", "Stays", "Event Spaces") are English-only; listing page "Booking Details" + "Reviews" headings English; favorites "Back to listings" English. All on FR-default views.
2. Logo nearly invisible on light navbar (white logo designed for dark backgrounds) — needs a dark logo variant for light surfaces, or a subtle dark chip behind it.

**Remaining i18n gaps (server-rendered metadata is intentionally static English for SEO):**
- Page `metadata` exports (layout, business, listing pages) — would need locale-aware routing (e.g. next-intl) to translate; deferred.
- Seeded listing descriptions/amenities in the DB are single-language (whatever the partner wrote) — by design.

### 2026-07-15 — Session 23: Landing-page refinement pass 1 (with user, step by step)

User-driven refinement loop: discuss → decide → build → user tests live. Decisions taken:
- **Homepage stays curated** (shop window, not warehouse) — full catalog in browse/search only. Keeps "featured homepage placement" sellable per the monetisation plan (25k XAF/month).
- **Platform owns all display vocabulary; partners own the facts.** Applied three times this session: amenities (checklist, not free text), prices (number in, formatted label out), services (name+price rows).

**Shipped (all deployed):**
1. `54bbb0c` — LogoWordmark component ("Reserve" dark serif + "237" gold) on light surfaces (navbar/auth/footer); PNG logo stays on dark surfaces. Icon swaps: accommodation → RiHotelBedLine, nightlife → RiGobletLine (in categoryColors.ts + business sign-up cards).
2. `e32c82d` — Amenity checklist: `lib/amenityOptions.ts` (per-category FR/EN catalog, canonical values = amenityIcons keys, MAX 10), AmenityPicker chips in listing drawer (pre-ticked on edit), saved via create/update actions, returned by getPartnerListings. CuratedCollections now rating+reviewCount sorted; Top Picks = featured-flag first, filled to 3.
3. `f51c546` — Price display: `lib/formatPrice.ts` — partners enter a number only; platform renders "45 000 XAF / nuit" (accommodation) or "À partir de 8 000 XAF" (others), FR/EN. Free-text priceLabel field REMOVED from drawer; stale labels cleared on next save; legacy bare-number labels ("8000") auto-parsed. Applied: homepage card, favorites, detail page (info card + booking rail), dashboard card.
4. `524f26f` — "Services & prices" menu: rows {name, priceXaf} in details JSONB (max 15, sanitized server-side), ServicesEditor in drawer, menu card on public listing page between amenities and videos. Amenity chips on detail page now translated via amenityLabel().

**Where we stopped / NEXT SESSION backlog (in priority order):**
1. i18n gaps from Session 22 findings — hero headline/subtitle, CategorySwitcher pills, "Booking Details" + "Reviews" headings on listing page, favorites "Back to listings".
2. Continue landing-page refinement walk (user reviews section by section).
3. Demo-seed cleanup plan agreed: keep seeds while <10 real partners; real bookings on seed listings = leads (visible only in Supabase, no partner behind them); when ready: `DELETE FROM listings WHERE business_id IS NULL;`
4. Video upload e2e still untested by a human (dashboard drawer → upload → thumbnail → public playback).
5. `NEXT_PUBLIC_APP_URL` on Vercel still points at the wrong domain (`-cameroon` instead of `-came`) — fix or skip if buying real domain.

---
