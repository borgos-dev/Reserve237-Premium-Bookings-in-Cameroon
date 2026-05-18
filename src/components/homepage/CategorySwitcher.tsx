"use client";

import { motion } from "motion/react";
import { useCategoryStore } from "@/stores";
import { RiRestaurantLine, RiHome4Line, RiBuildingLine } from "react-icons/ri";

const categories = [
  { id: "nightlife", label: "Dining & Nightlife", icon: RiRestaurantLine },
  { id: "stays", label: "Stays", icon: RiHome4Line },
  { id: "events", label: "Event Spaces", icon: RiBuildingLine },
] as const;

export function CategorySwitcher() {
  const { selectedCategory, setSelectedCategory } = useCategoryStore();

  return (
    <div className="glass px-2 py-2 rounded-full w-full max-w-full sm:w-fit mx-auto relative overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 relative z-10 min-w-max">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <motion.button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`relative px-4 sm:px-6 py-3 rounded-full font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-[var(--primary)] rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
