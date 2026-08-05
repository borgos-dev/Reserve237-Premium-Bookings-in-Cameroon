"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PremiumListingCard } from "./PremiumListingCard";
import { categoryColors, categoryIcons, categoryLabels, ALL_MAIN_CATEGORIES } from "@/lib/categoryColors";
import { useBrowseStore } from "@/stores";
import { RiAppsLine, RiSearchLine, RiCloseLine, RiMapPinLine } from "react-icons/ri";
import type { PublicListing } from "@/types/listing";
import { useLanguage } from "@/contexts/LanguageContext";

// Mirrors CITIES in src/db/schema/listings.ts — duplicated so this client
// component never pulls the drizzle schema into the browser bundle.
const CITIES = ["Yaounde", "Douala", "Limbe", "Bafoussam", "Bamenda", "Kribi"];

interface SearchFilterSectionProps {
  listings: PublicListing[];
}

export function SearchFilterSection({ listings }: SearchFilterSectionProps) {
  const { browseFilter, setBrowseFilter, searchQuery, setSearchQuery, cityFilter, setCityFilter } = useBrowseStore();
  const { t } = useLanguage();

  // Deep links: /?category=nightlife&city=Douala&q=rooftop#browse
  // (used by footer category links; read once on mount)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const city = params.get("city");
    const q = params.get("q");
    if (category && (ALL_MAIN_CATEGORIES as readonly string[]).includes(category)) {
      setBrowseFilter(category);
    }
    if (city && CITIES.includes(city)) setCityFilter(city);
    if (q) setSearchQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFiltering = browseFilter !== "all" || searchQuery.trim() !== "" || cityFilter !== "all";

  // City-first results: everything in the chosen city shows first; matches
  // from other cities appear below as suggestions only, never mixed in.
  const { cityMatches, otherCitySuggestions } = useMemo(() => {
    if (!isFiltering) return { cityMatches: [], otherCitySuggestions: [] };
    const q = searchQuery.toLowerCase().trim();
    const base = listings.filter((listing) => {
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
    if (cityFilter === "all") return { cityMatches: base, otherCitySuggestions: [] };
    const elsewhere = base
      .filter((l) => l.city !== cityFilter)
      .sort((a, b) =>
        b.rating !== a.rating ? b.rating - a.rating : (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
      )
      .slice(0, 6);
    return {
      cityMatches: base.filter((l) => l.city === cityFilter),
      otherCitySuggestions: elsewhere,
    };
  }, [searchQuery, browseFilter, cityFilter, isFiltering, listings]);

  return (
    <section className="py-12 bg-[var(--background)]" id="browse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Search Bar + City filter */}
        <div className="mb-6 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
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
          <div className="relative sm:w-52">
            <RiMapPinLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] pointer-events-none" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              aria-label={t("filter_city")}
              className="input-field pl-12 w-full py-4 text-base appearance-none cursor-pointer"
            >
              <option value="all">{t("all_cities")}</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
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
                {cityMatches.length} {cityMatches.length !== 1 ? t("listings_found_plural") : t("listings_found_singular")}
                {browseFilter !== "all" && (
                  <span className="ml-2">
                    {t("in_category")} <strong className="capitalize">
                      {t(`cat_${browseFilter.replace(/-/g, "_")}` as Parameters<typeof t>[0]) || categoryLabels[browseFilter]}
                    </strong>
                  </span>
                )}
                {cityFilter !== "all" && (
                  <span className="ml-1">
                    {t("in_city")} <strong>{cityFilter}</strong>
                  </span>
                )}
                {searchQuery && (
                  <span className="ml-1">{t("for_query")} &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
                )}
              </p>

              {cityMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cityMatches.map((listing, i) => (
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
                    {t("no_listings_found")}
                    {cityFilter !== "all" ? ` ${t("in_city")} ${cityFilter}` : ""}
                    {searchQuery ? ` ${t("for_query")} "${searchQuery}"` : ""}.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(""); setBrowseFilter("all"); setCityFilter("all"); }}
                    className="btn-secondary"
                  >
                    {t("clear_filters")}
                  </button>
                </div>
              )}

              {/* Suggestions from other cities — always AFTER everything in the
                  chosen city, clearly separated, never mixed into the results */}
              {otherCitySuggestions.length > 0 && (
                <div className="mt-16 pt-10 border-t border-[var(--border)]">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">{t("other_cities_title")}</h3>
                    <p className="text-[var(--muted-foreground)] text-sm mt-1">{t("other_cities_sub")}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherCitySuggestions.map((listing, i) => (
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
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
