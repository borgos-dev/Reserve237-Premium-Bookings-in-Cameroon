"use client";

import { motion } from "motion/react";
import { RiRestaurantLine, RiMusic2Line, RiGobletLine, RiHome4Line, RiTeamLine, RiBuildingLine } from "react-icons/ri";
import { useBrowseStore } from "@/stores";
import type { Category } from "@/data/listings";

const categories: { icon: React.ElementType; label: string; color: string; filter: Category }[] = [
  { icon: RiRestaurantLine, label: "Restaurants",     color: "from-[#E8B923] to-[#13695A]", filter: "restaurant"     },
  { icon: RiMusic2Line,     label: "Nightclubs",      color: "from-[#13695A] to-[#0A5C4A]", filter: "nightclub"      },
  { icon: RiGobletLine,     label: "Lounges",         color: "from-[#E8B923] to-[#13695A]", filter: "lounge"         },
  { icon: RiHome4Line,      label: "Guest Houses",    color: "from-[#13695A] to-[#0A5C4A]", filter: "guesthouse"     },
  { icon: RiTeamLine,       label: "Wedding Halls",   color: "from-[#E8B923] to-[#13695A]", filter: "wedding-hall"   },
  { icon: RiBuildingLine,   label: "Corporate Spaces",color: "from-[#13695A] to-[#0A5C4A]", filter: "corporate-space"},
];

export function CategoryGrid() {
  const { setBrowseFilter } = useBrowseStore();

  function handleCategoryClick(filter: Category) {
    setBrowseFilter(filter);
    setTimeout(() => {
      document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--surface-1)] to-[var(--surface-2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Explore All Categories</h2>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
            Discover the perfect venue or experience across all our categories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.label}
                onClick={() => handleCategoryClick(category.filter)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="group card p-8 flex flex-col items-center text-center hover:scale-105 transition-all cursor-pointer"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-8 h-8 text-[#F8F1EA]" />
                </div>
                <h3 className="text-xl font-semibold">{category.label}</h3>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
