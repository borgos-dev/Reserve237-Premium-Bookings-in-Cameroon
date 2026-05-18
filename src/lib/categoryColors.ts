export type CategoryColorSet = {
  text: string;
  border: string;
  activeBg: string;
  dot: string;
  accent: string;
};

export const categoryColors: Record<string, CategoryColorSet> = {
  restaurant:       { text: "text-amber-400",  border: "border-amber-500/50",  activeBg: "bg-amber-500/20",  dot: "bg-amber-400",  accent: "from-amber-500/20"  },
  nightclub:        { text: "text-purple-400", border: "border-purple-500/50", activeBg: "bg-purple-500/20", dot: "bg-purple-400", accent: "from-purple-500/20" },
  lounge:           { text: "text-rose-400",   border: "border-rose-500/50",   activeBg: "bg-rose-500/20",   dot: "bg-rose-400",   accent: "from-rose-500/20"   },
  bar:              { text: "text-orange-400", border: "border-orange-500/50", activeBg: "bg-orange-500/20", dot: "bg-orange-400", accent: "from-orange-500/20" },
  guesthouse:       { text: "text-blue-400",   border: "border-blue-500/50",   activeBg: "bg-blue-500/20",   dot: "bg-blue-400",   accent: "from-blue-500/20"   },
  hotel:            { text: "text-cyan-400",   border: "border-cyan-500/50",   activeBg: "bg-cyan-500/20",   dot: "bg-cyan-400",   accent: "from-cyan-500/20"   },
  "wedding-hall":   { text: "text-pink-400",   border: "border-pink-500/50",   activeBg: "bg-pink-500/20",   dot: "bg-pink-400",   accent: "from-pink-500/20"   },
  "corporate-space":{ text: "text-indigo-400", border: "border-indigo-500/50", activeBg: "bg-indigo-500/20", dot: "bg-indigo-400", accent: "from-indigo-500/20" },
  "event-venue":    { text: "text-green-400",  border: "border-green-500/50",  activeBg: "bg-green-500/20",  dot: "bg-green-400",  accent: "from-green-500/20"  },
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
