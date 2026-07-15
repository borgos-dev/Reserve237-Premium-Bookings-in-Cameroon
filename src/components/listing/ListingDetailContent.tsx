"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiShieldCheckLine,
  RiStarFill,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiTeamLine,
  RiHeartLine,
  RiHeartFill,
  RiCloseLine,
  RiImageLine,
  RiChat3Line,
  RiPhoneLine,
  RiWhatsappLine,
} from "react-icons/ri";
import { useFavoritesStore } from "@/stores";
import { getCategoryBadgeClass, categoryLabels } from "@/lib/categoryColors";
import { formatPriceLabel } from "@/lib/formatPrice";
import { amenityLabel } from "@/lib/amenityOptions";
import type { PublicListing } from "@/types/listing";
import type { PublicReview } from "@/actions/reviews";
import { useLanguage } from "@/contexts/LanguageContext";

type FullListing = PublicListing & {
  images: string[];
  description: string | null;
  videos: { url: string; posterUrl: string | null; durationSeconds: number }[];
};

interface Props {
  listing: FullListing;
  reviews: PublicReview[];
}


export function ListingDetailContent({ listing, reviews }: Props) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [mounted, setMounted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { t, lang } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  const photos = listing.images?.length ? listing.images : [listing.image];
  const favorite = mounted && isFavorite(listing.id);

  const openLightbox = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevPhoto = () => setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setLightboxIndex((i) => (i + 1) % photos.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen]);


const whatsappLink = listing.whatsapp
    ? `https://wa.me/${listing.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Bonjour, je suis intéressé(e) par votre établissement "${listing.name}" sur Reserve237. Puis-je avoir plus d'informations?`
      )}`
    : null;

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#1F2A2A]/95 flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between px-6 py-4 shrink-0">
              <span className="text-[#F8F1EA]/60 text-sm">{lightboxIndex + 1} / {photos.length}</span>
              <button onClick={closeLightbox} className="w-10 h-10 rounded-full bg-[#F8F1EA]/10 hover:bg-[#F8F1EA]/20 flex items-center justify-center transition-colors">
                <RiCloseLine className="w-5 h-5 text-[#F8F1EA]" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center relative px-16 min-h-0">
              <button onClick={prevPhoto} className="absolute left-4 w-12 h-12 rounded-full bg-[#F8F1EA]/10 hover:bg-[#F8F1EA]/25 flex items-center justify-center transition-colors">
                <RiArrowLeftSLine className="w-6 h-6 text-[#F8F1EA]" />
              </button>
              <motion.img
                key={lightboxIndex}
                src={photos[lightboxIndex]}
                alt={`${listing.name} photo ${lightboxIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-2xl"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
              />
              <button onClick={nextPhoto} className="absolute right-4 w-12 h-12 rounded-full bg-[#F8F1EA]/10 hover:bg-[#F8F1EA]/25 flex items-center justify-center transition-colors">
                <RiArrowRightSLine className="w-6 h-6 text-[#F8F1EA]" />
              </button>
            </div>
            <div className="flex gap-2 justify-center px-6 py-4 shrink-0 overflow-x-auto">
              {photos.map((src, i) => (
                <button key={i} onClick={() => setLightboxIndex(i)} className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === lightboxIndex ? "border-[#F8F1EA] scale-105" : "border-[#F8F1EA]/20 opacity-60 hover:opacity-90"}`}>
                  <Image src={src} alt="" fill sizes="64px" unoptimized={src.startsWith("http")} className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        {/* Back */}
        <Link href="/" className="md:hidden inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8">
          <RiArrowLeftLine className="w-4 h-4" /> {t("back_to_listings")}
        </Link>

        {/* ── Photo mosaic ── */}
        <motion.div className="mb-10" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Mobile: single hero */}
          <div className="md:hidden relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer group" onClick={() => openLightbox(0)}>
            <Image src={photos[0]} alt={listing.name} fill sizes="100vw" priority unoptimized={photos[0].startsWith("http")} className="object-cover" />
            {listing.verified && (
              <div className="absolute top-4 left-4 bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium shadow-lg">
                <RiShieldCheckLine className="w-4 h-4" /> {t("verified_partner")}
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); openLightbox(0); }} className="absolute bottom-4 right-4 bg-[#F8F1EA]/95 hover:bg-[#F8F1EA] text-[#1F2A2A] px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-sm">
              <RiImageLine className="w-4 h-4" /> {photos.length} photos
            </button>
          </div>

          {/* Desktop: mosaic */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-2 h-[420px]">
              <div className="relative col-span-2 row-span-2 rounded-3xl overflow-hidden cursor-pointer group" onClick={() => openLightbox(0)}>
                <Image src={photos[0]} alt={listing.name} fill sizes="(min-width: 1024px) 66vw, 100vw" priority unoptimized={photos[0].startsWith("http")} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#1F2A2A]/0 group-hover:bg-[#1F2A2A]/10 transition-colors" />
                {listing.verified && (
                  <div className="absolute top-5 left-5 bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-sm font-medium shadow-lg">
                    <RiShieldCheckLine className="w-4 h-4" /> {t("verified_partner")}
                  </div>
                )}
              </div>
              {photos[1] && (
                <div className="relative rounded-3xl overflow-hidden cursor-pointer group" onClick={() => openLightbox(1)}>
                  <Image src={photos[1]} alt="" fill sizes="33vw" unoptimized={photos[1].startsWith("http")} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                  <div className="absolute inset-0 bg-[#1F2A2A]/0 group-hover:bg-[#1F2A2A]/10 transition-colors" />
                </div>
              )}
              {photos[2] && (
                <div className="relative rounded-3xl overflow-hidden cursor-pointer group" onClick={() => openLightbox(2)}>
                  <Image src={photos[2]} alt="" fill sizes="33vw" unoptimized={photos[2].startsWith("http")} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                  <div className="absolute inset-0 bg-[#1F2A2A]/0 group-hover:bg-[#1F2A2A]/10 transition-colors" />
                </div>
              )}
            </div>
            {photos.length > 3 && (
              <div className="grid grid-cols-5 gap-2 mt-2 h-[120px]">
                {photos.slice(3, 8).map((src, i) => {
                  const realIndex = i + 3;
                  const isLastVisible = i === 4 && photos.length > 8;
                  return (
                    <div key={realIndex} className="relative rounded-2xl overflow-hidden cursor-pointer group" onClick={() => openLightbox(realIndex)}>
                      <Image src={src} alt="" fill sizes="20vw" unoptimized={src.startsWith("http")} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500" />
                      {isLastVisible ? (
                        <div className="absolute inset-0 bg-[#1F2A2A]/55 flex items-center justify-center">
                          <span className="text-[#F8F1EA] text-base font-semibold">+{photos.length - 8} photos</span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-[#1F2A2A]/0 group-hover:bg-[#1F2A2A]/10 transition-colors" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: details ── */}
          <motion.div className="lg:col-span-2 space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>

            {/* Title + meta */}
            <div>
              <span className={`badge capitalize inline-block mb-3 ${getCategoryBadgeClass(listing.mainCategory)}`}>
                {categoryLabels[listing.mainCategory] ?? listing.mainCategory}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">{listing.name}</h1>
              <div className="flex items-center gap-3 flex-wrap text-[var(--muted-foreground)]">
                <div className="flex items-center gap-1.5">
                  <RiStarFill className="w-5 h-5 text-[#E8B923]" />
                  <span className="font-semibold text-[var(--foreground)] text-lg">
                    {listing.rating > 0 ? listing.rating.toFixed(1) : "New"}
                  </span>
                  {listing.reviewCount > 0 && <span>({listing.reviewCount} reviews)</span>}
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <RiMapPinLine className="w-4 h-4" />
                  {listing.location}
                </div>
                {listing.priceRange && <><span>·</span><span className="capitalize">{listing.priceRange}</span></>}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">{t("about")}</h2>
                <p className="text-[var(--muted-foreground)] leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Key info */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-5">Booking Details</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="card p-5">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
                    <RiMapPinLine className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <p className="text-[var(--muted-foreground)] text-xs font-medium uppercase tracking-wide mb-1">Location</p>
                  <p className="font-semibold text-base">{listing.address ?? listing.location}</p>
                  <p className="text-[var(--muted-foreground)] text-sm mt-1">{listing.city}</p>
                </div>

                {formatPriceLabel(listing.priceMin, listing.mainCategory, lang, listing.priceLabel) && (
                  <div className="card p-5">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
                      <RiMoneyDollarCircleLine className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <p className="text-[var(--muted-foreground)] text-xs font-medium uppercase tracking-wide mb-1">Price</p>
                    <p className="font-semibold text-base text-[var(--primary)]">
                      {formatPriceLabel(listing.priceMin, listing.mainCategory, lang, listing.priceLabel)}
                    </p>
                    {listing.priceRange && <p className="text-[var(--muted-foreground)] text-sm mt-1 capitalize">{listing.priceRange}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("amenities")}</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity) => (
                    <span key={amenity} className="badge text-sm py-2 px-3">{amenityLabel(amenity, lang)}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Services & prices — menu card filled in by the business */}
            {listing.services.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("services_prices")}</h2>
                <div className="card divide-y divide-[var(--border)] p-0 overflow-hidden">
                  {listing.services.map((service, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className="text-sm font-semibold text-[var(--primary)] whitespace-nowrap">
                        {new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US").format(service.priceXaf)} XAF
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {listing.videos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("lv_videos")}</h2>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {listing.videos.map((video, i) => (
                    <video
                      key={i}
                      src={video.url}
                      poster={video.posterUrl ?? undefined}
                      controls
                      preload={video.posterUrl ? "none" : "metadata"}
                      className="h-48 sm:h-56 w-auto max-w-full rounded-2xl border border-[var(--border)] bg-black shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Specs strip */}
            <div className="card p-0 overflow-hidden">
              <div className="flex flex-wrap divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
                <div className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[160px]">
                  <RiStarFill className="w-5 h-5 text-[#E8B923] flex-none" />
                  <div>
                    <p className="text-base font-semibold leading-tight">{listing.rating > 0 ? listing.rating.toFixed(1) : "New"}</p>
                    <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mt-0.5">Rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[160px]">
                  <RiChat3Line className="w-5 h-5 text-[var(--primary)] flex-none" />
                  <div>
                    <p className="text-base font-semibold leading-tight">{listing.reviewCount}</p>
                    <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mt-0.5">Reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[160px]">
                  <RiTeamLine className="w-5 h-5 text-[var(--primary)] flex-none" />
                  <div>
                    <p className="text-base font-semibold leading-tight capitalize">{listing.subCategory.replace(/-/g, " ")}</p>
                    <p className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)] mt-0.5">Type</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews section */}
            <div id="reviews">
              <h2 className="text-xl font-semibold mb-4">
                Reviews
                {reviews.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                    ({reviews.length})
                  </span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-[var(--muted-foreground)] text-sm">
                    {t("no_reviews_yet")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="card">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{review.authorName}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <RiStarFill
                              key={i}
                              className={`w-3.5 h-3.5 ${i < review.rating ? "text-[#E8B923]" : "text-[var(--muted-foreground)]/20"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.body && (
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                          &ldquo;{review.body}&rdquo;
                        </p>
                      )}
                      {review.reply && (
                        <div className="mt-3 pl-4 border-l-2 border-[var(--primary)]/30">
                          <p className="text-xs font-medium text-[var(--primary)] mb-1">
                            Response from the business
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">{review.reply}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-[var(--muted-foreground)]/50 mt-2">
                        {new Date(review.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Right: sticky booking card ── */}
          <motion.div className="lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="card space-y-5">

                {/* Price */}
                <div>
                  <p className="text-[var(--muted-foreground)] text-sm">{t("starting_from")}</p>
                  <p className="text-2xl font-bold text-[var(--primary)] mt-0.5">
                    {formatPriceLabel(listing.priceMin, listing.mainCategory, lang, listing.priceLabel) ?? t("contact_for_price")}
                  </p>
                  {listing.priceRange && <span className="text-xs text-[var(--muted-foreground)] capitalize">{listing.priceRange}</span>}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 py-3 border-y border-[var(--border)]">
                  <RiStarFill className="w-5 h-5 text-[#E8B923] shrink-0" />
                  <span className="font-bold">{listing.rating > 0 ? listing.rating.toFixed(1) : "New"}</span>
                  {listing.reviewCount > 0 && <span className="text-[var(--muted-foreground)] text-sm">· {listing.reviewCount} reviews</span>}
                </div>

                {/* Book CTA — only shown when the listing has a bookable price */}
                {listing.priceMin != null ? (
                  <Link href={`/listing/${listing.slug}/book`} className="btn-primary w-full py-4 text-base font-semibold text-center block">
                    {t("book_now")}
                  </Link>
                ) : (
                  <p className="text-center text-sm text-[var(--muted-foreground)] py-2">
                    {t("contact_to_book")}
                  </p>
                )}

                {/* Save to favorites */}
                <button
                  onClick={() => toggleFavorite(listing)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-medium transition-all ${
                    favorite
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary)]/20"
                      : "btn-secondary"
                  }`}
                >
                  {favorite
                    ? <><RiHeartFill className="w-5 h-5" /> {t("saved")}</>
                    : <><RiHeartLine className="w-5 h-5" /> {t("save_to_favourites")}</>
                  }
                </button>

                {/* Contact buttons */}
                <div className="grid grid-cols-1 gap-3">
                  {/* WhatsApp — the most important button in Cameroon */}
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm bg-[#25D366] hover:bg-[#20BA5A] text-white transition-colors"
                    >
                      <RiWhatsappLine className="w-5 h-5" />
                      {t("contact_whatsapp")}
                    </a>
                  )}

                  {/* Phone call */}
                  {listing.phone && (
                    <a
                      href={`tel:${listing.phone}`}
                      className="flex items-center justify-center gap-2 py-3 btn-secondary rounded-2xl font-medium text-sm"
                    >
                      <RiPhoneLine className="w-4 h-4" />
                      {listing.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Verified note */}
              {listing.verified && (
                <div className="flex items-start gap-3 p-4 bg-[var(--primary)]/8 rounded-2xl border border-[var(--primary)]/20">
                  <RiShieldCheckLine className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--primary)]">{t("verified_partner")}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {t("verified_by_team")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
