// ─── Amenity catalog ──────────────────────────────────────────────────────────
// The platform owns the amenity vocabulary (not free text) so that filters,
// icons (see amenityIcons.ts) and FR/EN labels stay consistent everywhere.
// `value` is the canonical string stored in listing_amenities.name — it must
// match a key in amenityIcons.ts to get an icon on cards and detail pages.

export interface AmenityOption {
  value: string;
  en: string;
  fr: string;
}

const COMMON: AmenityOption[] = [
  { value: "WiFi",      en: "WiFi",           fr: "WiFi" },
  { value: "AC",        en: "AC",             fr: "Climatisation" },
  { value: "Parking",   en: "Parking",        fr: "Parking" },
  { value: "Generator", en: "Generator",      fr: "Groupe électrogène" },
  { value: "Security",  en: "Security",       fr: "Sécurité" },
];

export const AMENITY_OPTIONS: Record<string, AmenityOption[]> = {
  "food-drinks": [
    ...COMMON,
    { value: "Outdoor Seating", en: "Outdoor Seating", fr: "Terrasse" },
    { value: "Delivery",        en: "Delivery",        fr: "Livraison" },
    { value: "Takeaway",        en: "Takeaway",        fr: "À emporter" },
    { value: "Live Music",      en: "Live Music",      fr: "Musique live" },
    { value: "Bar",             en: "Bar",             fr: "Bar" },
    { value: "Private Rooms",   en: "Private Rooms",   fr: "Salons privés" },
  ],
  nightlife: [
    ...COMMON,
    { value: "Live Music",   en: "Live Music",   fr: "Musique live" },
    { value: "VIP Tables",   en: "VIP Tables",   fr: "Tables VIP" },
    { value: "Dance Floor",  en: "Dance Floor",  fr: "Piste de danse" },
    { value: "Rooftop",      en: "Rooftop",      fr: "Rooftop" },
    { value: "Outdoor Seating", en: "Outdoor Seating", fr: "Terrasse" },
    { value: "Sound System", en: "Sound System", fr: "Sono professionnelle" },
  ],
  "beauty-wellness": [
    ...COMMON,
    { value: "Private Rooms", en: "Private Rooms", fr: "Cabines privées" },
    { value: "Spa",           en: "Spa",           fr: "Spa" },
    { value: "Cafe",          en: "Cafe",          fr: "Café" },
  ],
  "events-venues": [
    ...COMMON,
    { value: "Sound System", en: "Sound System", fr: "Sonorisation" },
    { value: "Projector",    en: "Projector",    fr: "Projecteur" },
    { value: "Stage",        en: "Stage",        fr: "Scène" },
    { value: "Catering",     en: "Catering",     fr: "Traiteur" },
    { value: "Garden",       en: "Garden",       fr: "Jardin" },
    { value: "Outdoor Seating", en: "Outdoor Seating", fr: "Espace extérieur" },
  ],
  accommodation: [
    ...COMMON,
    { value: "Pool",       en: "Pool",       fr: "Piscine" },
    { value: "Breakfast",  en: "Breakfast",  fr: "Petit-déjeuner" },
    { value: "Restaurant", en: "Restaurant", fr: "Restaurant" },
    { value: "Bar",        en: "Bar",        fr: "Bar" },
    { value: "Gym",        en: "Gym",        fr: "Salle de sport" },
    { value: "Garden",     en: "Garden",     fr: "Jardin" },
    { value: "Rooftop",    en: "Rooftop",    fr: "Rooftop" },
  ],
  "transport-more": [
    ...COMMON,
    { value: "Cafe", en: "Cafe", fr: "Café" },
  ],
};

/** Max amenities a listing can carry — keeps cards tidy and honest. */
export const MAX_AMENITIES = 10;

export function amenityLabel(value: string, lang: "en" | "fr"): string {
  for (const opts of Object.values(AMENITY_OPTIONS)) {
    const found = opts.find((o) => o.value === value);
    if (found) return lang === "fr" ? found.fr : found.en;
  }
  return value;
}
