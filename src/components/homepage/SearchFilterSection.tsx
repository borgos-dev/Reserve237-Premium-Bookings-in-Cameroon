"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { allListings } from "@/data/listings";
import type { Category } from "@/data/listings";
import { PremiumListingCard } from "./PremiumListingCard";
import { categoryColors, categoryIcons, categoryLabels } from "@/lib/categoryColors";
import { useBrowseStore } from "@/stores";
import { RiAppsLine, RiSearchLine, RiCloseLine } from "react-icons/ri";

const uniqueCategories = [...new Set(allListings.map((l) => l.category))];

export function SearchFilterSection() {
  const { browseFilter, setBrowseFilter, searchQuery, setSearchQuery } = useBrowseStore();
  const activeCategory = browseFilter;
  const query = searchQuery;

  const isFiltering = activeCategory !== "all" || query.trim() !== "";

  const filtered = useMemo(() => {
    if (!isFiltering) return [];
    const q = query.toLowerCase();
    return allListings.filter((listing) => {
      const matchesQuery =
        q === "" ||
        listing.name.toLowerCase().includes(q) ||
        listing.description?.toLowerCase().includes(q) ||
        listing.location.toLowerCase().includes(q) ||
        listing.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesCategory =
        activeCategory === "all" || listing.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory, isFiltering]);

  return (
    <section className="py-12 bg-[var(--background)]" id="browse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Search Bar */}
        <div className="relative mb-6 max-w-2xl mx-auto">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search listings..."
            className="input-field pl-12 pr-10 w-full py-4 text-base"
            value={query}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="mb-4 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Browse by Category</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Choose the type of experience you want to reserve.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setBrowseFilter("all")}
            className={`flex min-h-24 flex-col items-start justify-between rounded-3xl border p-4 text-left transition-all ${
              activeCategory === "all"
                ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
              <RiAppsLine className="h-5 w-5 text-[var(--primary)]" />
            </span>
            <span className="text-sm font-semibold">All Listings</span>
          </button>
          {uniqueCategories.map((cat) => {
            const colors = categoryColors[cat];
            const Icon = categoryIcons[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setBrowseFilter(cat)}
                className={`flex min-h-24 flex-col items-start justify-between rounded-3xl border p-4 text-left transition-all ${
                  isActive
                    ? `${colors.activeBg} ${colors.text} ${colors.border}`
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${colors.activeBg}`}>
                  {Icon && <Icon className={`h-5 w-5 ${colors.text}`} />}
                </span>
                <span className="text-sm font-semibold leading-tight">
                  {categoryLabels[cat] ?? cat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results — only shown when actively filtering */}
        <AnimatePresence mode="wait">
          {isFiltering && (
            <motion.div
              key="results-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35 }}
              className="mt-10"
            >
              {/* Count */}
              <p className="text-[var(--muted-foreground)] text-sm mb-8">
                {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
                {activeCategory !== "all" && (
                  <span className="ml-2 capitalize">
                    in <strong>{categoryLabels[activeCategory] ?? activeCategory}</strong>
                  </span>
                )}
              </p>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filtered.map((listing, i) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                    >
                      <PremiumListingCard listing={listing} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <p className="text-[var(--muted-foreground)] text-lg mb-6">
                    No listings found{query ? ` for "${query}"` : ""}.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(""); setBrowseFilter("all"); }}
                    className="btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
