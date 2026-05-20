export type CategoryColorSet = {
  text: string;
  border: string;
  activeBg: string;
  dot: string;
  accent: string;
};

const primarySet: CategoryColorSet = {
  text: "text-[#13695A]",
  border: "border-[#13695A]/50",
  activeBg: "bg-[#13695A]/20",
  dot: "bg-[#13695A]",
  accent: "from-[#13695A]/20",
};

const accentSet: CategoryColorSet = {
  text: "text-[#E8B923]",
  border: "border-[#E8B923]/50",
  activeBg: "bg-[#E8B923]/20",
  dot: "bg-[#E8B923]",
  accent: "from-[#E8B923]/20",
};

export const categoryColors: Record<string, CategoryColorSet> = {
  restaurant:        accentSet,
  nightclub:         primarySet,
  lounge:            accentSet,
  bar:               accentSet,
  guesthouse:        primarySet,
  hotel:             primarySet,
  "wedding-hall":    accentSet,
  "corporate-space": primarySet,
  "event-venue":     primarySet,
};

export function getCategoryBadgeClass(category: string): string {
  const c = categoryColors[category];
  if (!c) return "bg-[var(--secondary)] text-[var(--muted-foreground)]";
  return `${c.activeBg} ${c.text} border ${c.border}`;
}

import {
  RiRestaurantLine,
  RiMusic2Line,
  RiGobletLine,
  RiDrinksFill,
  RiHome4Line,
  RiBuildingLine,
  RiTeamLine,
  RiBuilding2Line,
  RiCalendarEventLine,
} from "react-icons/ri";
import type { ElementType } from "react";

export const categoryIcons: Record<string, ElementType> = {
  restaurant:         RiRestaurantLine,
  nightclub:          RiMusic2Line,
  lounge:             RiGobletLine,
  bar:                RiDrinksFill,
  guesthouse:         RiHome4Line,
  hotel:              RiBuildingLine,
  "wedding-hall":     RiTeamLine,
  "corporate-space":  RiBuilding2Line,
  "event-venue":      RiCalendarEventLine,
};

export const categoryLabels: Record<string, string> = {
  restaurant:        "Restaurant",
  nightclub:         "Nightclub",
  lounge:            "Lounge",
  bar:               "Bar",
  guesthouse:        "Guest House",
  hotel:             "Hotel",
  "wedding-hall":    "Wedding Hall",
  "corporate-space": "Corporate Space",
  "event-venue":     "Event Venue",
};
