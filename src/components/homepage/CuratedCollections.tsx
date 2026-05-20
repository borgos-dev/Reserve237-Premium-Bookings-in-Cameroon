"use client";

import { motion } from "motion/react";
import { PremiumListingCard } from "./PremiumListingCard";
import { collections } from "@/data/listings";

export function CuratedCollections() {
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Curated Collections</h2>
          <p className="text-[var(--muted-foreground)] text-lg">
            Handpicked experiences from our verified partners
          </p>
        </motion.div>

        <div className="space-y-16">
          {collections.map((collection, collectionIndex) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: collectionIndex * 0.1, duration: 0.6 }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-semibold">{collection.title}</h3>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">{collection.subtitle}</p>
              </div>

              {/* Responsive Cards */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {collection.listings.map((listing) => (
                    <div key={listing.id} className="w-full min-w-0">
                      <PremiumListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
