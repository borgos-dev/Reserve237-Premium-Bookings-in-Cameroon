"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  RiHeartFill,
  RiDeleteBinLine,
  RiArrowLeftLine,
  RiMapPinLine,
  RiStarFill,
} from "react-icons/ri";
import { useFavoritesStore } from "@/stores";
import { generateSlug } from "@/lib/utils";
import { getCategoryBadgeClass } from "@/lib/categoryColors";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";

export default function FavoritesPage() {
  const { favorites, toggleFavorite, clearAll } = useFavoritesStore();

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Back — mobile only */}
        <Link
          href="/"
          className="md:hidden inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-10"
        >
          <RiArrowLeftLine className="w-4 h-4" />
          Back to listings
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">My Favorites</h1>
            <p className="text-[var(--muted-foreground)]">
              {favorites.length} saved listing{favorites.length !== 1 ? "s" : ""}
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={clearAll}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <RiDeleteBinLine className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <RiHeartFill className="w-16 h-16 text-[var(--border)] mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-3">No favorites yet</h2>
            <p className="text-[var(--muted-foreground)] mb-8">
              Start exploring and save listings you love
            </p>
            <Link href="/#browse" className="btn-primary">
              Browse Listings
            </Link>
          </motion.div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((listing, i) => {
              const slug = generateSlug(listing.name);
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="card group overflow-hidden"
                >
                  {/* Image */}
                  <Link
                    href={`/listing/${slug}`}
                    className="block relative aspect-[16/9] overflow-hidden rounded-2xl mb-4"
                  >
                    <Image
                      src={listing.image}
                      alt={listing.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      unoptimized={listing.image.startsWith("http")}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A2A]/40 to-transparent" />
                  </Link>

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/listing/${slug}`}>
                        <h3 className="font-semibold hover:text-[var(--primary)] transition-colors line-clamp-1">
                          {listing.name}
                        </h3>
                      </Link>
                      <button
                        onClick={() => toggleFavorite(listing)}
                        className="flex-none p-1.5 rounded-xl hover:bg-[var(--destructive)]/10 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
                        title="Remove from favorites"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <RiMapPinLine className="w-4 h-4 flex-none" />
                      <span className="text-sm">{listing.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`badge text-xs capitalize ${getCategoryBadgeClass(listing.category)}`}
                      >
                        {listing.category.replace(/-/g, " ")}
                      </span>
                      <div className="flex items-center gap-1 text-sm">
                        <RiStarFill className="w-3.5 h-3.5 text-[#E8B923]" />
                        <span className="font-medium">{listing.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      <span className="text-[var(--primary)] font-semibold text-sm">
                        {listing.price}
                      </span>
                      <Link
                        href={`/listing/${slug}`}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <NewFooter />
    </main>
  );
}
