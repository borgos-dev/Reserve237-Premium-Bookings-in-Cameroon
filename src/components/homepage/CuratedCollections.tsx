"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { PremiumListingCard } from "./PremiumListingCard";
import type { PublicListing } from "@/types/listing";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  listings: PublicListing[];
}

export function CuratedCollections({ listings }: Props) {
  const { t } = useLanguage();
  // Build collections dynamically from real DB listings
  const collections = useMemo(() => {
    const featured = listings.filter((l) => l.featured).slice(0, 3);
    const yaounde = listings.filter((l) => l.city === "Yaounde").slice(0, 3);
    const douala = listings.filter((l) => l.city === "Douala").slice(0, 3);
    const verified = listings.filter((l) => l.verified).slice(0, 3);
    const accommodation = listings
      .filter((l) => l.mainCategory === "accommodation")
      .slice(0, 3);

    const all = [
      featured.length >= 2 && {
        id: "featured",
        title: t("collection_top_picks"),
        subtitle: t("collection_top_picks_sub"),
        items: featured,
      },
      yaounde.length >= 2 && {
        id: "yaounde",
        title: t("collection_yaounde"),
        subtitle: t("collection_yaounde_sub"),
        items: yaounde,
      },
      douala.length >= 2 && {
        id: "douala",
        title: t("collection_douala"),
        subtitle: t("collection_douala_sub"),
        items: douala,
      },
      accommodation.length >= 2 && {
        id: "accommodation",
        title: t("collection_accommodation"),
        subtitle: t("collection_accommodation_sub"),
        items: accommodation,
      },
      verified.length >= 2 && {
        id: "verified",
        title: t("collection_verified"),
        subtitle: t("collection_verified_sub"),
        items: verified,
      },
    ].filter(Boolean) as { id: string; title: string; subtitle: string; items: PublicListing[] }[];

    // Show at most 3 collections
    return all.slice(0, 3);
  }, [listings, t]);

  if (collections.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("curated_collections")}</h2>
          <p className="text-[var(--muted-foreground)] text-lg">
            {t("curated_subtitle")}
          </p>
        </motion.div>

        <div className="space-y-16">
          {collections.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-semibold">{collection.title}</h3>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">{collection.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {collection.items.map((listing) => (
                  <div key={listing.id} className="w-full min-w-0">
                    <PremiumListingCard listing={listing} />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
