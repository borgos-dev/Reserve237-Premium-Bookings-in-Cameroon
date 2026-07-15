import {
  RiRestaurantLine,
  RiGobletLine,
  RiScissorsLine,
  RiCalendarEventLine,
  RiHotelBedLine,
  RiCarLine,
} from "react-icons/ri";
import type { ElementType } from "react";

export type CategoryColorSet = {
  text: string;
  border: string;
  activeBg: string;
  dot: string;
  accent: string;
};

// ─── New 6-category system ────────────────────────────────────────────────────

export const categoryColors: Record<string, CategoryColorSet> = {
  "food-drinks": {
    text: "text-amber-700",
    border: "border-amber-400/60",
    activeBg: "bg-amber-100",
    dot: "bg-amber-500",
    accent: "from-amber-100",
  },
  nightlife: {
    text: "text-purple-700",
    border: "border-purple-400/60",
    activeBg: "bg-purple-100",
    dot: "bg-purple-500",
    accent: "from-purple-100",
  },
  "beauty-wellness": {
    text: "text-pink-700",
    border: "border-pink-400/60",
    activeBg: "bg-pink-100",
    dot: "bg-pink-500",
    accent: "from-pink-100",
  },
  "events-venues": {
    text: "text-blue-700",
    border: "border-blue-400/60",
    activeBg: "bg-blue-100",
    dot: "bg-blue-500",
    accent: "from-blue-100",
  },
  accommodation: {
    text: "text-[#13695A]",
    border: "border-[#13695A]/50",
    activeBg: "bg-[#13695A]/15",
    dot: "bg-[#13695A]",
    accent: "from-[#13695A]/15",
  },
  "transport-more": {
    text: "text-green-700",
    border: "border-green-400/60",
    activeBg: "bg-green-100",
    dot: "bg-green-500",
    accent: "from-green-100",
  },
};

export const categoryIcons: Record<string, ElementType> = {
  "food-drinks":      RiRestaurantLine,
  nightlife:          RiGobletLine,
  "beauty-wellness":  RiScissorsLine,
  "events-venues":    RiCalendarEventLine,
  accommodation:      RiHotelBedLine,
  "transport-more":   RiCarLine,
};

export const categoryLabels: Record<string, string> = {
  "food-drinks":      "Food & Drinks",
  nightlife:          "Nightlife",
  "beauty-wellness":  "Beauty & Wellness",
  "events-venues":    "Events & Venues",
  accommodation:      "Accommodation",
  "transport-more":   "Transport & More",
};

export const ALL_MAIN_CATEGORIES = [
  "food-drinks",
  "nightlife",
  "beauty-wellness",
  "events-venues",
  "accommodation",
  "transport-more",
] as const;

export type MainCategory = (typeof ALL_MAIN_CATEGORIES)[number];

export function getCategoryBadgeClass(category: string): string {
  const c = categoryColors[category];
  if (!c) return "bg-[var(--secondary)] text-[var(--muted-foreground)]";
  return `${c.activeBg} ${c.text} border ${c.border}`;
}
