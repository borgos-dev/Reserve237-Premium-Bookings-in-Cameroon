"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  RiStarFill,
  RiShieldCheckLine,
  RiMapPinLine,
  RiHeartLine,
  RiHeartFill,
} from "react-icons/ri";
import { useFavoritesStore } from "@/stores";
import type { PublicListing } from "@/types/listing";
import { getCategoryBadgeClass, categoryLabels } from "@/lib/categoryColors";
import { formatPriceLabel } from "@/lib/formatPrice";
import { useLanguage } from "@/contexts/LanguageContext";

const NEW_LABEL: Record<string, string> = { fr: "Nouveau", en: "New" };

interface PremiumListingCardProps {
  listing: PublicListing;
}

export function PremiumListingCard({ listing }: PremiumListingCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { lang, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const favorite = mounted && isFavorite(listing.id);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer h-full"
    >
      <div className="flex flex-col h-full">

        {/* Image */}
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-4">
          <Link href={`/listing/${listing.slug}`} className="relative block w-full h-full">
            <Image
              src={listing.image}
              alt={listing.name}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              unoptimized={listing.image.startsWith("http")}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-[#1F2A2A]/80 via-[#1F2A2A]/20 to-transparent transition-opacity duration-300" />
          </Link>

          {/* Verified badge */}
          {listing.verified && (
            <div className="absolute top-4 left-4 bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium pointer-events-none">
              <RiShieldCheckLine className="w-3.5 h-3.5" />
              {t("verified_partner")}
            </div>
          )}

          {/* Rating badge */}
          <div className="absolute top-4 right-4 bg-[#1F2A2A]/60 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-medium text-[#F8F1EA] pointer-events-none">
            <RiStarFill className="w-3.5 h-3.5 text-[#E8B923]" />
            {listing.rating > 0 ? listing.rating.toFixed(1) : NEW_LABEL[lang]}
            {listing.reviewCount > 0 && (
              <span className="text-[#F8F1EA]/70 ml-0.5">({listing.reviewCount})</span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(listing); }}
            className="absolute top-[52px] right-4 w-9 h-9 rounded-full bg-[#1F2A2A]/60 backdrop-blur flex items-center justify-center hover:bg-[#1F2A2A]/80 transition-all"
            aria-label={favorite ? t("remove_from_favorites") : t("save_to_favourites")}
          >
            {favorite
              ? <RiHeartFill className="w-4 h-4 text-[var(--primary)]" />
              : <RiHeartLine className="w-4 h-4 text-[#F8F1EA]" />
            }
          </button>
        </div>

        {/* Card content */}
        <div className="flex-1 flex flex-col space-y-3">
          <Link href={`/listing/${listing.slug}`}>
            <h3 className="text-lg font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-1">
              {listing.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <RiMapPinLine className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{listing.location}</span>
          </div>

          {/* Category + top amenities */}
          <div className="flex gap-2 flex-wrap">
            <span className={`badge text-xs capitalize ${getCategoryBadgeClass(listing.mainCategory)}`}>
              {t(`cat_${listing.mainCategory.replace(/-/g, "_")}` as Parameters<typeof t>[0]) || categoryLabels[listing.mainCategory]}
            </span>
            {listing.amenities.slice(0, 2).map((amenity) => (
              <span key={amenity} className="badge text-xs">{amenity}</span>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-[var(--border)]">
            <span className="text-[var(--primary)] font-semibold text-sm">
              {formatPriceLabel(listing.priceMin, listing.mainCategory, lang, listing.priceLabel) ?? t("contact_for_price")}
            </span>
            <Link href={`/listing/${listing.slug}`} className="btn-primary text-sm py-1.5 px-4">
              {t("book_now")}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
