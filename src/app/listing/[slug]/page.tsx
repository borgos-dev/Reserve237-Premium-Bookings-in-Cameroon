"use client";

import { use, useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiShieldCheckLine,
  RiStarFill,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiTeamLine,
  RiHeartLine,
  RiHeartFill,
  RiNavigationLine,
  RiCloseLine,
  RiImageLine,
} from "react-icons/ri";
import { allListings } from "@/data/listings";
import { generateSlug } from "@/lib/utils";
import { getCategoryBadgeClass, categoryColors } from "@/lib/categoryColors";
import { amenityIcons } from "@/lib/amenityIcons";
import { useFavoritesStore } from "@/stores";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { MobileBottomNav } from "@/components/homepage/MobileBottomNav";
import { ColorSchemeSwitcher } from "@/components/homepage/ColorSchemeSwitcher";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ListingDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const listing = allListings.find((l) => generateSlug(l.name) === slug);
  if (!listing) notFound();

  const photos = listing.images?.length ? listing.images : [listing.image];

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [mounted, setMounted] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  const favorite = mounted && isFavorite(listing.id);
  const colors = categoryColors[listing.category];

  const prevPhoto = useCallback(() =>
    setActivePhoto((p) => (p - 1 + photos.length) % photos.length), [photos.length]);
  const nextPhoto = useCallback(() =>
    setActivePhoto((p) => (p + 1) % photos.length), [photos.length]);

  const openLightbox = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % photos.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen]);

  const priceRangeLevel =
    { budget: 1, "mid-range": 2, premium: 3, luxury: 4 }[listing.priceRange ?? "mid-range"] ?? 2;
  const ratingPercent = (listing.rating / 5) * 100;
  const capacityPercent = listing.capacity ? Math.min((listing.capacity / 600) * 100, 100) : 0;
  const popularityPercent = Math.min((listing.reviews / 400) * 100, 100);

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />
      <ColorSchemeSwitcher />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Lightbox header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0">
              <span className="text-white/60 text-sm">
                {lightboxIndex + 1} / {photos.length}
              </span>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <RiCloseLine className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Lightbox main image */}
            <div className="flex-1 flex items-center justify-center relative px-16 min-h-0">
              <button
                onClick={prevLightbox}
                className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <RiArrowLeftSLine className="w-6 h-6 text-white" />
              </button>
              <motion.img
                key={lightboxIndex}
                src={photos[lightboxIndex]}
                alt={`${listing.name} photo ${lightboxIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-2xl"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <button
                onClick={nextLightbox}
                className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <RiArrowRightSLine className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Lightbox thumbnails */}
            <div className="flex gap-2 justify-center px-6 py-4 shrink-0 overflow-x-auto scrollbar-hide">
              {photos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    i === lightboxIndex ? "border-white scale-105" : "border-white/20 opacity-60 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="64px"
                    unoptimized={src.startsWith("http")}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8"
        >
          <RiArrowLeftLine className="w-4 h-4" />
          Back to listings
        </Link>

        {/* ── Photo Mosaic Gallery ── */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile: single hero with "view all" overlay */}
          <div className="md:hidden relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={photos[0]}
              alt={listing.name}
              fill
              sizes="100vw"
              priority
              unoptimized={photos[0].startsWith("http")}
              className="object-cover"
            />
            {listing.verified && (
              <div className="absolute top-4 left-4 bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium shadow-lg">
                <RiShieldCheckLine className="w-4 h-4" />
                Verified Partner
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); openLightbox(0); }}
              className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-black px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-sm"
            >
              <RiImageLine className="w-4 h-4" />
              {photos.length} photos
            </button>
          </div>

          {/* Desktop / Tablet: mosaic grid */}
          <div className="hidden md:block">
            {/* Top row: hero + 2 stacked */}
            <div className="grid grid-cols-3 gap-2 h-[420px]">
              {/* Hero (spans 2 cols, full height) */}
              <div
                className="relative col-span-2 row-span-2 rounded-3xl overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <Image
                  src={photos[0]}
                  alt={listing.name}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  priority
                  unoptimized={photos[0].startsWith("http")}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {listing.verified && (
                  <div className="absolute top-5 left-5 bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-sm font-medium shadow-lg">
                    <RiShieldCheckLine className="w-4 h-4" />
                    Verified Partner
                  </div>
                )}
              </div>

              {/* Top-right image */}
              {photos[1] && (
                <div
                  className="relative rounded-3xl overflow-hidden cursor-pointer group"
                  onClick={() => openLightbox(1)}
                >
                  <Image
                    src={photos[1]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    unoptimized={photos[1].startsWith("http")}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              )}

              {/* Bottom-right image */}
              {photos[2] && (
                <div
                  className="relative rounded-3xl overflow-hidden cursor-pointer group"
                  onClick={() => openLightbox(2)}
                >
                  <Image
                    src={photos[2]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    unoptimized={photos[2].startsWith("http")}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              )}
            </div>

            {/* Bottom row: 5 thumbnails */}
            {photos.length > 3 && (
              <div className="grid grid-cols-5 gap-2 mt-2 h-[120px]">
                {photos.slice(3, 8).map((src, i) => {
                  const realIndex = i + 3;
                  const isLastVisible = i === 4 && photos.length > 8;
                  const extraCount = photos.length - 8;
                  return (
                    <div
                      key={realIndex}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      onClick={() => openLightbox(realIndex)}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="20vw"
                        unoptimized={src.startsWith("http")}
                        className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                      />
                      {isLastVisible ? (
                        <div className="absolute inset-0 bg-black/55 group-hover:bg-black/70 transition-colors flex items-center justify-center">
                          <span className="text-white text-base font-semibold">
                            +{extraCount} photos
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left col: Details ── */}
          <motion.div
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Category + Title */}
            <div>
              <span className={`badge capitalize inline-block mb-3 ${getCategoryBadgeClass(listing.category)}`}>
                {listing.category.replace(/-/g, " ")}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">{listing.name}</h1>
              <div className="flex items-center gap-3 flex-wrap text-[var(--muted-foreground)]">
                <div className="flex items-center gap-1.5">
                  <RiStarFill className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-[var(--foreground)] text-lg">{listing.rating}</span>
                  <span>({listing.reviews} reviews)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <RiMapPinLine className="w-4 h-4" />
                  {listing.location}
                </div>
                {listing.priceRange && (
                  <>
                    <span>·</span>
                    <span className="capitalize">{listing.priceRange}</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-[var(--muted-foreground)] leading-relaxed text-base">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Key info cards */}
            <div>
              <div className="mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Booking Details</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Essential information before you reserve this place.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="card p-5">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
                    <RiMapPinLine className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <p className="text-[var(--muted-foreground)] text-xs font-medium uppercase tracking-wide mb-1">Location</p>
                  <p className="font-semibold text-base leading-snug">{listing.location}</p>
                  {listing.city && <p className="text-[var(--muted-foreground)] text-sm mt-1">{listing.city}</p>}
                </div>

                <div className="card p-5">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
                    <RiMoneyDollarCircleLine className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <p className="text-[var(--muted-foreground)] text-xs font-medium uppercase tracking-wide mb-1">Price</p>
                  <p className="font-semibold text-base leading-snug text-[var(--primary)]">{listing.price}</p>
                  {listing.priceRange && (
                    <p className="text-[var(--muted-foreground)] text-sm mt-1 capitalize">{listing.priceRange}</p>
                  )}
                </div>

                {listing.capacity && (
                  <div className="card p-5">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
                      <RiTeamLine className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <p className="text-[var(--muted-foreground)] text-xs font-medium uppercase tracking-wide mb-1">Capacity</p>
                    <p className="font-semibold text-base leading-snug">{listing.capacity} guests</p>
                  </div>
                )}

                {listing.hours && (
                  <div className="card p-5">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
                      <RiTimeLine className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <p className="text-[var(--muted-foreground)] text-xs font-medium uppercase tracking-wide mb-1">Hours</p>
                    <p className="font-semibold text-base leading-snug">{listing.hours.open} - {listing.hours.close}</p>
                    <p className="text-[var(--muted-foreground)] text-sm mt-1">{listing.hours.days}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {listing.tags.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => {
                    const Icon = amenityIcons[tag as keyof typeof amenityIcons];
                    return (
                      <span key={tag} className="badge flex items-center gap-1.5 text-sm py-2 px-3">
                        {Icon && <Icon className="w-3.5 h-3.5 flex-none" />}
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats cards */}
            <div>
              <div className="mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">At a Glance</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Quick signals to help you compare this listing with confidence.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Rating", value: `${listing.rating} / 5.0`, pct: ratingPercent, color: "bg-yellow-400" },
                { label: "Popularity", value: `${listing.reviews} reviews`, pct: popularityPercent, color: "bg-[var(--primary)]" },
                ...(listing.capacity ? [{ label: "Capacity", value: `${listing.capacity} guests`, pct: capacityPercent, color: "bg-green-400" }] : []),
                ...(listing.priceRange ? [{ label: "Price Level", value: listing.priceRange, pct: (priceRangeLevel / 4) * 100, color: "bg-blue-400" }] : []),
              ].map((stat, i) => (
                <div key={stat.label} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-[var(--muted-foreground)] text-xs font-medium uppercase tracking-wide mb-1">
                        {stat.label}
                      </p>
                      <p className="font-semibold text-base capitalize">{stat.value}</p>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-[var(--primary)]/40 mt-1" />
                  </div>
                  <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${stat.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                </div>
              ))}
              </div>
            </div>
          </motion.div>

          {/* ── Right col: Sticky Booking Card ── */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="card space-y-5">
                {/* Price */}
                <div>
                  <p className="text-[var(--muted-foreground)] text-sm">Starting from</p>
                  <p className="text-2xl font-bold text-[var(--primary)] mt-0.5">{listing.price}</p>
                  {listing.priceRange && (
                    <span className="text-xs text-[var(--muted-foreground)] capitalize">{listing.priceRange}</span>
                  )}
                </div>

                {/* Rating summary */}
                <div className="flex items-center gap-2 py-3 border-y border-[var(--border)]">
                  <RiStarFill className="w-5 h-5 text-yellow-400 shrink-0" />
                  <span className="font-bold">{listing.rating}</span>
                  <span className="text-[var(--muted-foreground)] text-sm">· {listing.reviews} reviews</span>
                </div>

                {/* Book CTA */}
                <button className="btn-primary w-full py-4 text-base font-semibold">
                  Book Now
                </button>

                {/* Favorite */}
                <button
                  onClick={() => toggleFavorite(listing)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-medium transition-all ${
                    favorite
                      ? "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
                      : "btn-secondary"
                  }`}
                >
                  {favorite ? (
                    <><RiHeartFill className="w-5 h-5" /> Saved</>
                  ) : (
                    <><RiHeartLine className="w-5 h-5" /> Save to Favorites</>
                  )}
                </button>

                {/* Contact buttons */}
                <div className="grid grid-cols-1 gap-3">
                  <button
                    className="flex items-center justify-center gap-2 py-3 btn-secondary rounded-2xl font-medium text-sm"
                  >
                    <RiNavigationLine className="w-4 h-4" />
                    Directions
                  </button>
                </div>
              </div>

              {/* Verified note */}
              {listing.verified && (
                <div className="flex items-start gap-3 p-4 bg-[var(--primary)]/8 rounded-2xl border border-[var(--primary)]/20">
                  <RiShieldCheckLine className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--primary)]">Verified Partner</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      This listing has been verified by the Reserve237 team.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <NewFooter />
      <MobileBottomNav />
    </main>
  );
}
