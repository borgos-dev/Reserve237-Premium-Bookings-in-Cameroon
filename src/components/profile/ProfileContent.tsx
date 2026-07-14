"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useUser } from "@clerk/nextjs";
import {
  RiCalendarLine,
  RiMapPinLine,
  RiTeamLine,
  RiMoneyDollarCircleLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiTimer2Line,
  RiStarLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiCheckLine,
  RiUserLine,
  RiEditLine,
  RiHistoryLine,
} from "react-icons/ri";
import { updateBookingStatus } from "@/actions/bookings";
import { submitReview } from "@/actions/reviews";
import type { UserBooking } from "@/actions/user";
import { useLanguage } from "@/contexts/LanguageContext";
import { RiStarFill } from "react-icons/ri";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileContentProps {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  bookings: UserBooking[];
}

type BookingTab = "upcoming" | "past";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-CM").format(Math.round(n)) + " XAF";

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "U";
}

const PAYMENT_LABELS: Record<string, string> = {
  "mtn-momo": "MTN MoMo",
  "orange-money": "Orange Money",
  card: "Card",
  cash: "Cash on Arrival",
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const STATUS_CONFIG: Record<string, { label: string; icon: typeof RiTimer2Line; bg: string; text: string }> = {
    pending: { label: t("status_pending"), icon: RiTimer2Line, bg: "bg-amber-100", text: "text-amber-700" },
    confirmed: { label: t("status_confirmed"), icon: RiCheckboxCircleFill, bg: "bg-green-100", text: "text-green-700" },
    completed: { label: t("status_completed"), icon: RiStarLine, bg: "bg-blue-100", text: "text-blue-700" },
    cancelled: { label: t("status_cancelled"), icon: RiCloseCircleFill, bg: "bg-red-100", text: "text-red-600" },
  };
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function formatDateRange(b: UserBooking): string {
  if (b.checkIn && b.checkOut) return `${b.checkIn} → ${b.checkOut}`;
  if (b.checkIn) return b.checkIn;
  if (b.bookingDate) return b.bookingTime ? `${b.bookingDate} · ${b.bookingTime}` : b.bookingDate;
  return "—";
}

const today = new Date().toISOString().slice(0, 10);

function isUpcoming(b: UserBooking): boolean {
  if (b.status === "cancelled" || b.status === "completed") return false;
  const dateStr = b.checkIn ?? b.bookingDate ?? "";
  if (!dateStr) return b.status === "pending" || b.status === "confirmed";
  return dateStr >= today;
}

// ─── Star picker ─────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${n} star${n !== 1 ? "s" : ""}`}
        >
          <RiStarFill
            className={`w-7 h-7 transition-colors ${
              (hover || value) >= n ? "text-[#E8B923]" : "text-[var(--muted-foreground)]/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  userId,
  authorName,
  onCancel,
  onReviewSubmitted,
}: {
  booking: UserBooking;
  userId: string;
  authorName: string;
  onCancel: (id: string) => void;
  onReviewSubmitted: (bookingId: string) => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [localHasReviewed, setLocalHasReviewed] = useState(booking.hasReviewed);

  async function handleCancel() {
    setCancelling(true);
    const result = await updateBookingStatus(booking.id, userId, "cancelled");
    setCancelling(false);
    if (result.success) onCancel(booking.id);
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return setReviewError(t("select_star_rating"));
    setSubmittingReview(true);
    setReviewError("");
    const result = await submitReview({
      bookingId: booking.id,
      userId,
      authorName,
      rating,
      body: reviewBody || undefined,
    });
    setSubmittingReview(false);
    if (result.success) {
      setLocalHasReviewed(true);
      setShowReviewForm(false);
      onReviewSubmitted(booking.id);
    } else {
      setReviewError(result.error);
    }
  }

  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const canReview = !localHasReviewed &&
    (booking.status === "confirmed" || booking.status === "completed");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <Link
            href={`/listing/${booking.listingSlug}`}
            className="font-semibold text-base hover:text-[var(--primary)] transition-colors truncate block"
          >
            {booking.listingName}
          </Link>
          <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
            {t("booking_id_label")}: {booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <RiCalendarLine className="w-4 h-4 shrink-0 text-[var(--primary)]" />
          <span className="text-xs">{formatDateRange(booking)}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <RiTeamLine className="w-4 h-4 shrink-0 text-[var(--primary)]" />
          <span className="text-xs">{booking.guests} guest{booking.guests !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <RiMoneyDollarCircleLine className="w-4 h-4 shrink-0 text-[var(--primary)]" />
          <span className="text-xs">{PAYMENT_LABELS[booking.paymentMethod] ?? booking.paymentMethod}</span>
        </div>
      </div>

      {/* Amount + actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] flex-wrap gap-3">
        <div>
          <p className="text-xs text-[var(--muted-foreground)]">{t("total_paid_label")}</p>
          <p className="font-bold text-[var(--primary)] text-base">{fmt(booking.totalXaf)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/listing/${booking.listingSlug}`}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {t("view_listing")}
            <RiArrowRightLine className="w-3.5 h-3.5" />
          </Link>

          {canReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E8B923]/40 text-[#B8920A] bg-[#E8B923]/10 hover:bg-[#E8B923]/20 transition-colors"
            >
              <RiStarLine className="w-3.5 h-3.5" />
              {t("write_review")}
            </button>
          )}

          {localHasReviewed && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <RiCheckLine className="w-3.5 h-3.5 text-green-500" />
              {t("reviewed")}
            </span>
          )}

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {cancelling
                ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                : <RiCloseCircleFill className="w-3.5 h-3.5" />
              }
              {t("cancel")}
            </button>
          )}
        </div>
      </div>

      {/* ── Inline review form ── */}
      {showReviewForm && (
        <form
          onSubmit={handleReviewSubmit}
          className="border-t border-[var(--border)] pt-4 space-y-4"
        >
          <div>
            <p className="text-sm font-semibold mb-2">
              {t("how_was_experience")} {booking.listingName}?
            </p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">
              {t("share_experience")}{" "}
              <span className="text-[var(--muted-foreground)]/50">({t("optional")})</span>
            </label>
            <textarea
              rows={3}
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              placeholder={t("what_enjoyed")}
              className="input-field w-full resize-none text-sm"
            />
          </div>

          {reviewError && (
            <p className="text-xs text-red-500">{reviewError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowReviewForm(false); setRating(0); setReviewBody(""); setReviewError(""); }}
              className="px-4 py-2 text-xs rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submittingReview || rating === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--primary)] text-white hover:bg-[#0A5C4A] transition-colors disabled:opacity-50"
            >
              {submittingReview
                ? <><RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> {t("submitting")}</>
                : <><RiCheckLine className="w-3.5 h-3.5" /> {t("submit_review")}</>
              }
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProfileContent({
  userId,
  firstName,
  lastName,
  email,
  bookings: initialBookings,
}: ProfileContentProps) {
  const { user } = useUser();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState(initialBookings);
  const [tab, setTab] = useState<BookingTab>("upcoming");

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState({ firstName, lastName });
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const upcoming = useMemo(() => bookings.filter(isUpcoming), [bookings]);
  const past = useMemo(() => bookings.filter((b) => !isUpcoming(b)), [bookings]);
  const displayed = tab === "upcoming" ? upcoming : past;

  function handleCancel(id: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
  }

  function handleReviewSubmitted(bookingId: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, hasReviewed: true } : b))
    );
  }

  async function saveProfileName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      await (user as any)?.update({
        firstName: editName.firstName.trim(),
        lastName: editName.lastName.trim(),
      });
      setNameSaved(true);
      setEditing(false);
      setTimeout(() => setNameSaved(false), 3000);
    } catch {
      // silent fail — name update is best-effort
    } finally {
      setSavingName(false);
    }
  }

  const displayName = [
    user?.firstName ?? firstName,
    user?.lastName ?? lastName,
  ].filter(Boolean).join(" ") || "Customer";

  const initials = getInitials(
    user?.firstName ?? firstName,
    user?.lastName ?? lastName
  );

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* ── Profile header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 mb-8"
        >
          <div className="flex items-start gap-5 flex-wrap">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {!editing ? (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold leading-tight">{displayName}</h1>
                    <p className="text-[var(--muted-foreground)] text-sm mt-0.5">{email}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1.5">
                        <RiHistoryLine className="w-4 h-4" />
                        {bookings.length} {bookings.length !== 1 ? t("booking_plural") : t("booking_singular")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditName({ firstName: user?.firstName ?? firstName, lastName: user?.lastName ?? lastName });
                      setEditing(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors shrink-0"
                  >
                    <RiEditLine className="w-3.5 h-3.5" />
                    {t("edit")}
                  </button>
                </div>
              ) : (
                <form onSubmit={saveProfileName} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-1">First name</label>
                      <input
                        type="text"
                        value={editName.firstName}
                        onChange={(e) => setEditName((p) => ({ ...p, firstName: e.target.value }))}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--muted-foreground)] mb-1">Last name</label>
                      <input
                        type="text"
                        value={editName.lastName}
                        onChange={(e) => setEditName((p) => ({ ...p, lastName: e.target.value }))}
                        className="input-field w-full text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingName}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-[var(--primary)] text-white hover:bg-[#0A5C4A] transition-colors disabled:opacity-60"
                    >
                      {savingName
                        ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                        : <RiCheckLine className="w-3.5 h-3.5" />
                      }
                      {t("save")}
                    </button>
                  </div>
                </form>
              )}

              {nameSaved && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <RiCheckLine className="w-3.5 h-3.5" /> {t("name_updated")}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Booking history ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold mb-5">{t("my_bookings")}</h2>

          {/* Tabs */}
          <div className="flex gap-1 bg-[var(--secondary)] rounded-xl p-1 mb-6 w-fit">
            {([
              { key: "upcoming" as const, label: t("upcoming"), count: upcoming.length },
              { key: "past" as const, label: t("past"), count: past.length },
            ]).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === key
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    tab === key ? "bg-[var(--primary)]/15 text-[var(--primary)]" : "bg-[var(--muted-foreground)]/15"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Booking list */}
          {displayed.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-16 text-center">
              <div className="w-14 h-14 bg-[var(--secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                {tab === "upcoming"
                  ? <RiCalendarLine className="w-7 h-7 text-[var(--muted-foreground)]" />
                  : <RiHistoryLine className="w-7 h-7 text-[var(--muted-foreground)]" />
                }
              </div>
              <p className="font-semibold text-[var(--muted-foreground)] mb-2">
                {tab === "upcoming" ? t("no_upcoming_bookings") : t("no_past_bookings")}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]/60 mb-6">
                {tab === "upcoming"
                  ? t("browse_and_book")
                  : t("past_bookings_here")}
              </p>
              {tab === "upcoming" && (
                <Link href="/#browse" className="btn-primary text-sm">
                  {t("browse_listings")}
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayed.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  userId={userId}
                  authorName={displayName}
                  onCancel={handleCancel}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
