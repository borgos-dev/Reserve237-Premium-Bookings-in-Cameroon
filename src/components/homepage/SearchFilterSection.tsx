"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PremiumListingCard } from "./PremiumListingCard";
import { categoryColors, categoryIcons, categoryLabels, ALL_MAIN_CATEGORIES } from "@/lib/categoryColors";
import { useBrowseStore } from "@/stores";
import { RiAppsLine, RiSearchLine, RiCloseLine } from "react-icons/ri";
import type { PublicListing } from "@/types/listing";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchFilterSectionProps {
  listings: PublicListing[];
}

export function SearchFilterSection({ listings }: SearchFilterSectionProps) {
  const { browseFilter, setBrowseFilter, searchQuery, setSearchQuery } = useBrowseStore();
  const { t } = useLanguage();

  const isFiltering = browseFilter !== "all" || searchQuery.trim() !== "";

  const filtered = useMemo(() => {
    if (!isFiltering) return [];
    const q = searchQuery.toLowerCase().trim();
    return listings.filter((listing) => {
      const matchesQuery =
        q === "" ||
        listing.name.toLowerCase().includes(q) ||
        listing.location.toLowerCase().includes(q) ||
        listing.city.toLowerCase().includes(q) ||
        (listing.neighborhood?.toLowerCase().includes(q) ?? false) ||
        listing.amenities.some((a) => a.toLowerCase().includes(q));
      const matchesCategory =
        browseFilter === "all" || listing.mainCategory === browseFilter;
      return matchesQuery && matchesCategory;
    });
  }, [searchQuery, browseFilter, isFiltering, listings]);

  return (
    <section className="py-12 bg-[var(--background)]" id="browse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Search Bar */}
        <div className="relative mb-6 max-w-2xl mx-auto">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            type="text"
            placeholder={t("search_placeholder")}
            className="input-field pl-12 pr-10 w-full py-4 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
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
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t("browse_by_category")}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {t("browse_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* All */}
          <button
            onClick={() => setBrowseFilter("all")}
            className={`flex min-h-24 flex-col items-start justify-between rounded-3xl border p-4 text-left transition-all ${
              browseFilter === "all"
                ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
              <RiAppsLine className="h-5 w-5 text-[var(--primary)]" />
            </span>
            <span className="text-sm font-semibold">{t("cat_all")}</span>
          </button>

          {/* 6 main categories */}
          {ALL_MAIN_CATEGORIES.map((cat) => {
            const colors = categoryColors[cat];
            const Icon = categoryIcons[cat];
            const isActive = browseFilter === cat;
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
                  {t(`cat_${cat.replace(/-/g, "_")}` as Parameters<typeof t>[0]) || categoryLabels[cat]}
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
              <p className="text-[var(--muted-foreground)] text-sm mb-8">
                {filtered.length} {filtered.length !== 1 ? t("listings_found_plural") : t("listings_found_singular")}
                {browseFilter !== "all" && (
                  <span className="ml-2">
                    {t("in_category")} <strong className="capitalize">
                      {t(`cat_${browseFilter.replace(/-/g, "_")}` as Parameters<typeof t>[0]) || categoryLabels[browseFilter]}
                    </strong>
                  </span>
                )}
                {searchQuery && (
                  <span className="ml-1">pour &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
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
                    {t("no_listings_found")}{searchQuery ? ` pour "${searchQuery}"` : ""}.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(""); setBrowseFilter("all"); }}
                    className="btn-secondary"
                  >
                    {t("clear_filters")}
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
