"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  RiStarFill,
  RiShieldCheckLine,
  RiNavigationLine,
  RiMapPinLine,
  RiHeartLine,
  RiHeartFill,
} from "react-icons/ri";
import { useFavoritesStore } from "@/stores";
import { Listing } from "@/data/listings";
import { generateSlug } from "@/lib/utils";
import { getCategoryBadgeClass } from "@/lib/categoryColors";
import { amenityIcons } from "@/lib/amenityIcons";

interface PremiumListingCardProps {
  listing: Listing;
}

export function PremiumListingCard({ listing }: PremiumListingCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const favorite = mounted && isFavorite(listing.id);
  const slug = generateSlug(listing.name);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer h-full"
    >
      <div className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-4">
          <Link href={`/listing/${slug}`} className="block w-full h-full">
            <Image
              src={listing.image}
              alt={listing.name}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              unoptimized={listing.image.startsWith("http")}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
          </Link>

          {/* Verified Badge */}
          {listing.verified && (
            <div className="absolute top-4 left-4 bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium pointer-events-none">
              <RiShieldCheckLine className="w-3.5 h-3.5" />
              Verified
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-medium pointer-events-none">
            <RiStarFill className="w-3.5 h-3.5 text-yellow-400" />
            {listing.rating} ({listing.reviews})
          </div>

          {/* Favorite Button — below the rating badge */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(listing);
            }}
            className="absolute top-[52px] right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition-all"
          >
            {favorite
              ? <RiHeartFill className="w-4 h-4 text-red-500" />
              : <RiHeartLine className="w-4 h-4 text-white" />
            }
          </button>

          {/* Hover Action Buttons */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-300">
            <button className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2">
              <RiNavigationLine className="w-4 h-4" />
              Directions
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="flex-1 flex flex-col space-y-3">
          <Link href={`/listing/${slug}`}>
            <h3 className="text-lg font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-1">
              {listing.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <RiMapPinLine className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{listing.location}</span>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            <span className={`badge text-xs capitalize ${getCategoryBadgeClass(listing.category)}`}>
              {listing.category.replace(/-/g, " ")}
            </span>
            {listing.tags.slice(0, 2).map((tag) => {
              const Icon = amenityIcons[tag as keyof typeof amenityIcons];
              return (
                <span key={tag} className="badge text-xs flex items-center gap-1">
                  {Icon && <Icon className="w-3 h-3 flex-none" />}
                  {tag}
                </span>
              );
            })}
          </div>

          {/* Price + CTA */}
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-[var(--border)]">
            <span className="text-[var(--primary)] font-semibold text-sm">{listing.price}</span>
            <Link href={`/listing/${slug}`} className="btn-primary text-sm py-1.5 px-4">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
