"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCloseLine,
  RiImageAddLine,
  RiVideoAddLine,
  RiMapPinLine,
  RiStoreLine,
  RiCheckLine,
  RiLoader4Line,
  RiAlertLine,
  RiEyeLine,
  RiEyeOffLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import {
  createListing,
  updateListing,
  deleteListing,
  toggleListingActive,
  getPartnerListings,
  getPartnerListingWithImages,
  type CreateListingInput,
} from "@/actions/listings";
import {
  getListingVideos,
  uploadListingVideo,
  deleteListingVideo,
  type ListingVideoSummary,
} from "@/actions/listing-videos";
import { VIDEO_LIMITS, MAX_VIDEO_FILE_SIZE_MB } from "@/lib/videoLimits";
import { AMENITY_OPTIONS, MAX_AMENITIES } from "@/lib/amenityOptions";
import { amenityIcons } from "@/lib/amenityIcons";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

// ─── Types ────────────────────────────────────────────────────────────────────

type PartnerListing = {
  id: string;
  name: string;
  slug: string;
  mainCategory: string;
  subCategory: string;
  city: string;
  neighborhood: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  priceMin: number | null;
  priceMax: number | null;
  priceLabel: string | null;
  priceRange: string | null;
  description: string | null;
  rating: string | null;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  image: string | null;  // primary image URL from Supabase Storage
  capacity: number | null;
  amenities: string[];
};

interface ListingsManagerProps {
  initialListings: PartnerListing[];
  userId: string;
  businessPlan: "free" | "basic" | "premium";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAIN_CATEGORIES: { value: string; label: TranslationKey }[] = [
  { value: "food-drinks", label: "cat_food_drinks" },
  { value: "nightlife", label: "cat_nightlife" },
  { value: "beauty-wellness", label: "cat_beauty_wellness" },
  { value: "events-venues", label: "cat_events_venues" },
  { value: "accommodation", label: "cat_accommodation" },
  { value: "transport-more", label: "cat_transport_more" },
];

function catLabel(value: string, t: (key: TranslationKey) => string): string {
  const c = MAIN_CATEGORIES.find((c) => c.value === value);
  return c ? t(c.label) : value;
}

const SUB_CATEGORIES: Record<string, { value: string; en: string; fr: string }[]> = {
  "food-drinks": [
    { value: "restaurant", en: "Restaurant", fr: "Restaurant" },
    { value: "snack-bar", en: "Snack Bar", fr: "Snack-bar" },
    { value: "cafe", en: "Café", fr: "Café" },
    { value: "bakery", en: "Bakery", fr: "Boulangerie" },
    { value: "fast-food", en: "Fast Food", fr: "Fast-food" },
  ],
  nightlife: [
    { value: "nightclub", en: "Night Club", fr: "Boîte de nuit" },
    { value: "lounge", en: "Lounge", fr: "Lounge" },
    { value: "bar", en: "Bar", fr: "Bar" },
    { value: "sports-bar", en: "Sports Bar", fr: "Bar sportif" },
    { value: "rooftop-bar", en: "Rooftop Bar", fr: "Bar rooftop" },
  ],
  "beauty-wellness": [
    { value: "salon", en: "Salon", fr: "Salon de coiffure" },
    { value: "spa", en: "Spa", fr: "Spa" },
    { value: "barbershop", en: "Barbershop", fr: "Barbier" },
    { value: "nail-studio", en: "Nail Studio", fr: "Onglerie" },
    { value: "massage-center", en: "Massage Center", fr: "Centre de massage" },
  ],
  "events-venues": [
    { value: "wedding-hall", en: "Wedding Hall", fr: "Salle de mariage" },
    { value: "conference-room", en: "Conference Room", fr: "Salle de conférence" },
    { value: "stadium", en: "Stadium", fr: "Stade" },
    { value: "theatre", en: "Theatre", fr: "Théâtre" },
    { value: "outdoor-venue", en: "Outdoor Venue", fr: "Espace extérieur" },
  ],
  accommodation: [
    { value: "hotel", en: "Hotel", fr: "Hôtel" },
    { value: "guesthouse", en: "Guest House", fr: "Maison d'hôtes" },
    { value: "villa", en: "Villa", fr: "Villa" },
    { value: "apartment", en: "Apartment", fr: "Appartement" },
    { value: "hostel", en: "Hostel", fr: "Auberge" },
  ],
  "transport-more": [
    { value: "car-hire", en: "Car Hire", fr: "Location de voiture" },
    { value: "tour-operator", en: "Tour Operator", fr: "Tour opérateur" },
    { value: "clinic", en: "Clinic", fr: "Clinique" },
    { value: "pharmacy", en: "Pharmacy", fr: "Pharmacie" },
    { value: "travel-agency", en: "Travel Agency", fr: "Agence de voyage" },
  ],
};

const CITIES = ["Yaounde", "Douala", "Limbe", "Bafoussam", "Bamenda", "Kribi"];
const PRICE_RANGES: { value: string; label: TranslationKey }[] = [
  { value: "budget", label: "pr_budget" },
  { value: "mid-range", label: "pr_mid_range" },
  { value: "premium", label: "pr_premium" },
  { value: "luxury", label: "pr_luxury" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "food-drinks": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  nightlife: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "beauty-wellness": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  "events-venues": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  accommodation: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  "transport-more": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

// ─── Empty form state ──────────────────────────────────────────────────────────

const emptyForm = {
  name: "",
  mainCategory: "accommodation",
  subCategory: "hotel",
  city: "Yaounde",
  neighborhood: "",
  address: "",
  phone: "",
  whatsapp: "",
  priceMin: "",
  priceLabel: "",
  priceRange: "mid-range" as const,
  description: "",
  capacity: "",
};

// ─── Input component ──────────────────────────────────────────────────────────

// ─── Amenity checklist ─────────────────────────────────────────────────────────
// Platform-owned vocabulary (see amenityOptions.ts): partners tick what they
// offer; values are canonical so filters, icons and FR/EN labels stay in sync.

function AmenityPicker({
  category,
  selected,
  onToggle,
}: {
  category: string;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const { t, lang } = useLanguage();
  const options = AMENITY_OPTIONS[category] ?? [];
  if (options.length === 0) return null;
  const atLimit = selected.length >= MAX_AMENITIES;

  return (
    <div>
      <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5 font-medium">
        {t("lm_amenities")}{" "}
        <span className="normal-case tracking-normal text-[var(--text-tertiary)]">
          {selected.length}/{MAX_AMENITIES}
        </span>
      </span>
      <p className="text-xs text-[var(--text-tertiary)] mb-2">{t("lm_amenities_hint")}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isOn = selected.includes(opt.value);
          const Icon = amenityIcons[opt.value];
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              disabled={!isOn && atLimit}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                isOn
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                  : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/50"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {lang === "fr" ? opt.fr : opt.en}
              {isOn && <RiCheckLine className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-1.5 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder:text-[var(--text-tertiary)] text-sm";

const selectCls =
  "w-full px-3 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--foreground)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm";

// ─── Photo upload area ─────────────────────────────────────────────────────────

function PhotoUpload({
  previews,
  onAdd,
  onRemove,
}: {
  previews: string[];
  onAdd: (files: File[]) => void;
  onRemove: (i: number) => void;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-2 font-medium">
        {t("lm_photos")} <span className="normal-case tracking-normal text-[var(--text-tertiary)]">{t("lm_up_to_5")}</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--border)] group">
            <Image src={src} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <RiCloseLine className="w-5 h-5 text-white" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[9px] bg-[var(--primary)] text-white px-1.5 py-0.5 rounded-md font-medium">
                {t("lm_cover")}
              </span>
            )}
          </div>
        ))}
        {previews.length < 5 && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          >
            <RiImageAddLine className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t("lm_add_photo")}</span>
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).slice(0, 5 - previews.length);
          onAdd(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Video upload area ─────────────────────────────────────────────────────────

function VideoManager({
  videos,
  maxVideos,
  maxDurationSeconds,
  uploading,
  deletingId,
  error,
  onAdd,
  onRemove,
}: {
  videos: ListingVideoSummary[];
  maxVideos: number;
  maxDurationSeconds: number;
  uploading: boolean;
  deletingId: string | null;
  error: string | null;
  onAdd: (file: File, durationSeconds: number, poster: Blob | null) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Grab a frame ~1s in as a JPEG thumbnail. Resolves null if the browser
  // can't decode the codec — the upload proceeds without a poster.
  function capturePoster(video: HTMLVideoElement): Promise<Blob | null> {
    return new Promise((resolve) => {
      const bail = setTimeout(() => resolve(null), 5000);
      video.onseeked = () => {
        try {
          const scale = Math.min(1, 640 / (video.videoWidth || 640));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round((video.videoWidth || 640) * scale);
          canvas.height = Math.round((video.videoHeight || 360) * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) { clearTimeout(bail); resolve(null); return; }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => { clearTimeout(bail); resolve(blob); }, "image/jpeg", 0.82);
        } catch {
          clearTimeout(bail);
          resolve(null);
        }
      };
      video.onerror = () => { clearTimeout(bail); resolve(null); };
      video.currentTime = Math.min(1, (video.duration || 2) / 2);
    });
  }

  function handleFile(file: File) {
    setLocalError(null);
    if (file.size > MAX_VIDEO_FILE_SIZE_MB * 1024 * 1024) {
      setLocalError(t("lm_video_too_large"));
      return;
    }
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = async () => {
      const duration = Math.round(video.duration);
      if (duration > maxDurationSeconds) {
        URL.revokeObjectURL(video.src);
        setLocalError(t("lm_video_too_long"));
        return;
      }
      const poster = await capturePoster(video);
      URL.revokeObjectURL(video.src);
      onAdd(file, duration, poster);
    };
    video.src = URL.createObjectURL(file);
  }

  return (
    <div>
      <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] block mb-2 font-medium">
        {t("lm_videos")}{" "}
        <span className="normal-case tracking-normal text-[var(--text-tertiary)]">
          {videos.length}/{maxVideos} · {maxDurationSeconds}s {t("lm_video_max_suffix")}
        </span>
      </span>
      <div className="flex flex-wrap gap-2">
        {videos.map((v) => (
          <div key={v.id} className="relative w-28 h-20 rounded-xl overflow-hidden border border-[var(--border)] group bg-black">
            {v.posterUrl ? (
              <img src={v.posterUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <video src={v.url} className="w-full h-full object-cover" muted preload="metadata" />
            )}
            <button
              type="button"
              onClick={() => onRemove(v.id)}
              disabled={deletingId === v.id}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              {deletingId === v.id ? (
                <RiLoader4Line className="w-5 h-5 text-white animate-spin" />
              ) : (
                <RiCloseLine className="w-5 h-5 text-white" />
              )}
            </button>
            <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-md font-medium">
              {v.durationSeconds}s
            </span>
          </div>
        ))}
        {videos.length < maxVideos && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="w-28 h-20 rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-[var(--muted-foreground)] hover:text-[var(--primary)] disabled:opacity-50"
          >
            {uploading ? (
              <RiLoader4Line className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <RiVideoAddLine className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t("lm_add_video")}</span>
              </>
            )}
          </button>
        )}
      </div>
      {(localError || error) && (
        <p className="text-xs text-red-500 mt-2">{localError || error}</p>
      )}
      <input
        ref={ref}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ListingsManager({ initialListings, userId, businessPlan }: ListingsManagerProps) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<PartnerListing[]>(initialListings);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PartnerListing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartnerListing | null>(null);

  // Form state
  const [form, setForm] = useState(emptyForm);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Videos (edit mode only — require a saved listing)
  const [videos, setVideos] = useState<ListingVideoSummary[]>([]);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoLimits = VIDEO_LIMITS[businessPlan];

  const f = useCallback(
    (key: keyof typeof emptyForm) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    []
  );

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setSelectedAmenities([]);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setExistingPhotos([]);
    setRemovedPhotoUrls([]);
    setFormError(null);
    setVideos([]);
    setVideoError(null);
    setModalOpen(true);
  }

  // Deep link from the dashboard topbar ("+ New listing" -> ?new=1)
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openCreate();
      router.replace("/dashboard/listings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function openEdit(listing: PartnerListing) {
    setEditTarget(listing);
    setForm({
      name: listing.name,
      mainCategory: listing.mainCategory,
      subCategory: listing.subCategory,
      city: listing.city,
      neighborhood: listing.neighborhood ?? "",
      address: listing.address ?? "",
      phone: listing.phone ?? "",
      whatsapp: listing.whatsapp ?? "",
      priceMin: listing.priceMin != null ? String(listing.priceMin) : "",
      priceLabel: listing.priceLabel ?? "",
      priceRange: (listing.priceRange as typeof emptyForm.priceRange) ?? "mid-range",
      description: listing.description ?? "",
      capacity: listing.capacity != null ? String(listing.capacity) : "",
    });
    setSelectedAmenities(listing.amenities ?? []);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setRemovedPhotoUrls([]);
    setExistingPhotos(listing.image ? [listing.image] : []);
    setFormError(null);
    setVideos([]);
    setVideoError(null);
    setModalOpen(true);

    // Load the full photo set (the list view only carries the primary image)
    const full = await getPartnerListingWithImages(listing.id, userId);
    if (full) setExistingPhotos(full.images.map((img) => img.url));

    const vids = await getListingVideos(listing.id);
    setVideos(vids);
  }

  // Existing photos not marked for removal, shown first, followed by new uploads
  const visibleExistingPhotos = existingPhotos.filter((url) => !removedPhotoUrls.includes(url));
  const displayPhotos = [...visibleExistingPhotos, ...photoPreviews];

  function addPhotos(files: File[]) {
    const room = Math.max(0, 5 - displayPhotos.length);
    const accepted = files.slice(0, room);
    const previews = accepted.map((f) => URL.createObjectURL(f));
    setPhotoFiles((prev) => [...prev, ...accepted]);
    setPhotoPreviews((prev) => [...prev, ...previews]);
  }

  function removePhoto(i: number) {
    if (i < visibleExistingPhotos.length) {
      const url = visibleExistingPhotos[i];
      setRemovedPhotoUrls((prev) => [...prev, url]);
      return;
    }
    const newIdx = i - visibleExistingPhotos.length;
    setPhotoFiles((prev) => prev.filter((_, idx) => idx !== newIdx));
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[newIdx]);
      return prev.filter((_, idx) => idx !== newIdx);
    });
  }

  async function handleAddVideo(file: File, durationSeconds: number, poster: Blob | null) {
    if (!editTarget) return;
    setUploadingVideo(true);
    setVideoError(null);

    const formData = new FormData();
    formData.append("video", file);
    if (poster) formData.append("poster", poster, "poster.jpg");
    const result = await uploadListingVideo(editTarget.id, userId, durationSeconds, formData);

    setUploadingVideo(false);
    if (!result.success) {
      setVideoError(result.error);
      return;
    }
    setVideos((prev) => [...prev, result.video]);
  }

  async function handleRemoveVideo(id: string) {
    setDeletingVideoId(id);
    const result = await deleteListingVideo(id, userId);
    setDeletingVideoId(null);
    if (result.success) {
      setVideos((prev) => prev.filter((v) => v.id !== id));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.city) return;

    setSaving(true);
    setFormError(null);

    const imageFormData = new FormData();
    photoFiles.forEach((f) => imageFormData.append("images", f));

    const input: CreateListingInput = {
      userId,
      name: form.name.trim(),
      mainCategory: form.mainCategory,
      subCategory: form.subCategory,
      city: form.city,
      neighborhood: form.neighborhood || undefined,
      address: form.address || undefined,
      phone: form.phone || undefined,
      whatsapp: form.whatsapp || undefined,
      priceMin: form.priceMin ? Number(form.priceMin) : undefined,
      priceLabel: form.priceLabel || undefined,
      priceRange: (form.priceRange as CreateListingInput["priceRange"]) || undefined,
      description: form.description || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      amenities: selectedAmenities,
    };

    let result;
    if (editTarget) {
      result = await updateListing(
        { ...input, listingId: editTarget.id, removeImageUrls: removedPhotoUrls },
        imageFormData
      );
    } else {
      result = await createListing(input, imageFormData);
    }

    if (!result.success) {
      setSaving(false);
      setFormError(result.error);
      return;
    }

    // Re-fetch so photos, slug, price and capacity all stay in sync with the DB
    const refreshed = await getPartnerListings(userId);
    setItems(refreshed);

    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setSaving(false);
    setModalOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteListing(deleteTarget.id, userId);
    setDeleting(false);
    if (result.success) {
      setItems((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  }

  async function handleToggleActive(listing: PartnerListing) {
    setTogglingId(listing.id);
    const result = await toggleListingActive(listing.id, userId, !listing.active);
    setTogglingId(null);
    if (result.success) {
      setItems((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, active: !l.active } : l))
      );
    }
  }

  const activeCount = items.filter((l) => l.active).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">{t("dash_my_listings")}</h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            {items.length} {t("lm_total")} · {activeCount} {t("ov_active")} · {items.length - activeCount} {t("ov_inactive")}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[#0A5C4A] text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <RiAddLine className="w-4 h-4" />
          {t("lm_add_listing")}
        </button>
      </div>

      {/* ── Empty state ── */}
      {items.length === 0 && (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RiStoreLine className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("lm_none_title")}</h2>
          <p className="text-[var(--muted-foreground)] text-sm mb-6 max-w-xs mx-auto">
            {t("lm_none_sub")}
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[#0A5C4A] text-white rounded-xl font-medium text-sm transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            {t("lm_add_first")}
          </button>
        </div>
      )}

      {/* ── Listings grid ── */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((listing) => (
            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={`card overflow-hidden transition-opacity ${!listing.active ? "opacity-60" : ""}`}
            >
              {/* Photo — real image or placeholder */}
              <div className="relative h-40 bg-[var(--surface-1)] overflow-hidden">
                {listing.image ? (
                  <Image
                    src={listing.image}
                    alt={listing.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    unoptimized={listing.image.startsWith("http")}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-[var(--muted-foreground)]/40">
                    <RiImageAddLine className="w-7 h-7" />
                    <span className="text-[10px] font-medium">{t("lm_no_photo")}</span>
                  </div>
                )}
                {!listing.active && (
                  <div className="absolute inset-0 bg-[var(--background)]/60 flex items-center justify-center">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] bg-[var(--card)] px-2 py-1 rounded-lg border border-[var(--border)]">
                      {t("lm_inactive")}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* Category badge + name */}
                <div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${CATEGORY_COLORS[listing.mainCategory] ?? "bg-gray-100 text-gray-700"}`}>
                    {catLabel(listing.mainCategory, t)}
                  </span>
                  <h3 className="font-semibold text-base mt-1.5 leading-tight">{listing.name}</h3>
                  <div className="flex items-center gap-1 text-[var(--muted-foreground)] text-xs mt-1">
                    <RiMapPinLine className="w-3.5 h-3.5" />
                    {listing.city}{listing.neighborhood ? `, ${listing.neighborhood}` : ""}
                  </div>
                </div>

                {listing.priceLabel && (
                  <p className="text-sm font-medium text-[var(--primary)]">{listing.priceLabel}</p>
                )}

                {/* Actions row */}
                <div className="flex items-center gap-2 pt-1 border-t border-[var(--border)]">
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleActive(listing)}
                    disabled={togglingId === listing.id}
                    title={listing.active ? t("lm_deactivate") : t("lm_activate")}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                      listing.active
                        ? "text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900/30"
                        : "text-[var(--muted-foreground)] bg-[var(--surface-1)] hover:bg-[var(--secondary)]"
                    }`}
                  >
                    {togglingId === listing.id ? (
                      <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                    ) : listing.active ? (
                      <RiEyeLine className="w-3.5 h-3.5" />
                    ) : (
                      <RiEyeOffLine className="w-3.5 h-3.5" />
                    )}
                    {listing.active ? t("lm_active") : t("lm_inactive")}
                  </button>

                  <div className="flex-1" />

                  {/* Preview on site */}
                  <Link
                    href={`/listing/${listing.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("lm_preview")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                  >
                    <RiExternalLinkLine className="w-4 h-4" />
                  </Link>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(listing)}
                    title={t("lm_edit_listing")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <RiEditLine className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(listing)}
                    title={t("lm_delete_listing")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* Create / Edit Modal */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setModalOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-[var(--card)] border-l border-[var(--border)] flex flex-col shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
                <h2 className="text-lg font-bold">
                  {editTarget ? t("lm_edit_title") : t("lm_add_title")}
                </h2>
                <button
                  onClick={() => !saving && setModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--secondary)] transition-colors text-[var(--muted-foreground)]"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer form */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Photos */}
                <PhotoUpload
                  previews={displayPhotos}
                  onAdd={addPhotos}
                  onRemove={removePhoto}
                />

                {/* Videos — edit mode only (requires a saved listing) */}
                {editTarget ? (
                  <VideoManager
                    videos={videos}
                    maxVideos={videoLimits.maxVideos}
                    maxDurationSeconds={videoLimits.maxDurationSeconds}
                    uploading={uploadingVideo}
                    deletingId={deletingVideoId}
                    error={videoError}
                    onAdd={handleAddVideo}
                    onRemove={handleRemoveVideo}
                  />
                ) : (
                  <div className="text-xs text-[var(--text-tertiary)] bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-3">
                    {t("lm_video_save_first")}
                  </div>
                )}

                {/* Name */}
                <Field label={t("lm_listing_name")} required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={f("name")}
                    required
                    placeholder={t("lm_name_ph")}
                    className={inputCls}
                  />
                </Field>

                {/* Category row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("lm_category")} required>
                    <select
                      value={form.mainCategory}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const firstSub = SUB_CATEGORIES[cat]?.[0]?.value ?? "";
                        setForm((p) => ({ ...p, mainCategory: cat, subCategory: firstSub }));
                      }}
                      className={selectCls}
                    >
                      {MAIN_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{t(c.label)}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label={t("type")} required>
                    <select value={form.subCategory} onChange={f("subCategory")} className={selectCls}>
                      {(SUB_CATEGORIES[form.mainCategory] ?? []).map((s) => (
                        <option key={s.value} value={s.value}>{lang === "fr" ? s.fr : s.en}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* City + Neighborhood */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("city_label")} required>
                    <select value={form.city} onChange={f("city")} className={selectCls}>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label={t("neighbourhood_label")}>
                    <input
                      type="text"
                      value={form.neighborhood}
                      onChange={f("neighborhood")}
                      placeholder="e.g. Bastos"
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Address */}
                <Field label={t("lm_address")}>
                  <input
                    type="text"
                    value={form.address}
                    onChange={f("address")}
                    placeholder={t("lm_address_ph")}
                    className={inputCls}
                  />
                </Field>

                {/* Phone + WhatsApp */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("lm_phone")}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={f("phone")}
                      placeholder="+237 6XX XXX XXX"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t("bsu_whatsapp")}>
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={f("whatsapp")}
                      placeholder="+237 6XX XXX XXX"
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Numeric price — drives online booking totals */}
                <Field label={t("lm_price_min")}>
                  <input
                    type="number"
                    value={form.priceMin}
                    onChange={f("priceMin")}
                    placeholder={t("lm_price_min_ph")}
                    min={0}
                    className={inputCls}
                  />
                  <span className="text-xs text-[var(--text-tertiary)] block mt-1.5">
                    {t("lm_price_min_hint")}
                  </span>
                </Field>

                {/* Price */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("lm_price_label")}>
                    <input
                      type="text"
                      value={form.priceLabel}
                      onChange={f("priceLabel")}
                      placeholder={t("lm_price_label_ph")}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t("lm_price_range")}>
                    <select value={form.priceRange} onChange={f("priceRange")} className={selectCls}>
                      {PRICE_RANGES.map((r) => (
                        <option key={r.value} value={r.value}>{t(r.label)}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Capacity */}
                <Field label={t("lm_capacity")}>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={f("capacity")}
                    placeholder={t("lm_capacity_ph")}
                    min={1}
                    className={inputCls}
                  />
                </Field>

                {/* Description */}
                <Field label={t("lm_description")}>
                  <textarea
                    value={form.description}
                    onChange={f("description")}
                    rows={4}
                    placeholder={t("lm_description_ph")}
                    className={`${inputCls} resize-none`}
                  />
                </Field>

                {/* Amenities checklist — options follow the selected category */}
                <AmenityPicker
                  category={form.mainCategory}
                  selected={selectedAmenities}
                  onToggle={(value) =>
                    setSelectedAmenities((prev) =>
                      prev.includes(value)
                        ? prev.filter((v) => v !== value)
                        : prev.length < MAX_AMENITIES
                        ? [...prev, value]
                        : prev
                    )
                  }
                />

                {/* Error */}
                {formError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    <RiAlertLine className="w-4 h-4 mt-0.5 shrink-0" />
                    {formError}
                  </div>
                )}
              </form>

              {/* Drawer footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-[var(--border)] shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--secondary)] transition-colors disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  form=""
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[#0A5C4A] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("lm_saving")}</>
                  ) : (
                    <><RiCheckLine className="w-4 h-4" /> {editTarget ? t("lm_save_changes") : t("lm_create")}</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* Delete confirmation dialog */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm card p-6"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-4">
                <RiDeleteBinLine className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">{t("lm_delete_q")}</h3>
              <p className="text-[var(--muted-foreground)] text-sm mb-6">
                <span className="font-semibold text-[var(--foreground)]">{deleteTarget.name}</span> {t("lm_delete_warning")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--secondary)] transition-colors disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("lm_deleting")}</>
                  ) : (
                    t("lm_delete")
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
