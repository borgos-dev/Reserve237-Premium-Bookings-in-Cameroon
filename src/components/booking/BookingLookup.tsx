"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  RiSearchLine,
  RiLoader4Line,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiTimer2Line,
  RiStarLine,
  RiCalendarLine,
  RiTeamLine,
  RiPhoneLine,
  RiArrowRightLine,
  RiTicketLine,
} from "react-icons/ri";
import {
  lookupGuestBooking,
  cancelGuestBooking,
  type GuestBookingView,
} from "@/actions/bookings";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-CM").format(Math.round(n)) + " XAF";

const STATUS_CONFIG: Record<
  string,
  { label: TranslationKey; icon: typeof RiTimer2Line; bg: string; text: string }
> = {
  pending: { label: "status_pending", icon: RiTimer2Line, bg: "bg-amber-100", text: "text-amber-700" },
  confirmed: { label: "status_confirmed", icon: RiCheckboxCircleFill, bg: "bg-green-100", text: "text-green-700" },
  cancelled: { label: "status_cancelled", icon: RiCloseCircleFill, bg: "bg-red-100", text: "text-red-600" },
  completed: { label: "status_completed", icon: RiStarLine, bg: "bg-blue-100", text: "text-blue-700" },
};

export function BookingLookup() {
  const { t } = useLanguage();
  const [ref, setRef] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<GuestBookingView | null>(null);

  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBooking(null);
    const result = await lookupGuestBooking(ref, contact);
    setLoading(false);
    if (result.success) setBooking(result.booking);
    else setError(result.error);
  }

  async function handleCancel() {
    setCancelling(true);
    setError("");
    const result = await cancelGuestBooking(ref, contact, cancelReason || undefined);
    setCancelling(false);
    if (result.success) {
      setConfirmingCancel(false);
      setBooking((b) => (b ? { ...b, status: "cancelled", canCancel: false } : b));
    } else {
      setError(result.error ?? t("cancel_failed"));
    }
  }

  const cfg = booking ? STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending : null;
  const StatusIcon = cfg?.icon ?? RiTimer2Line;

  return (
    <>
      <NewNavbar />
      <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen pt-28 pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
              <RiTicketLine className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {t("lookup_title")}
            </h1>
            <p className="text-[var(--muted-foreground)] text-sm mt-2">
              {t("lookup_sub")}
            </p>
          </motion.div>

          {/* ── Lookup form ── */}
          <motion.form
            onSubmit={handleLookup}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 space-y-4"
          >
            <div>
              <label htmlFor="ref" className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                {t("lookup_ref_label")}
              </label>
              <input
                id="ref"
                type="text"
                required
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="A1B2C3D4"
                maxLength={8}
                className="input-field w-full font-mono tracking-[0.2em] uppercase"
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                {t("lookup_contact_label")}
              </label>
              <input
                id="contact"
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t("lookup_contact_ph")}
                className="input-field w-full"
              />
              <p className="text-[11px] text-[var(--muted-foreground)]/70 mt-1.5">
                {t("lookup_contact_hint")}
              </p>
            </div>

            {error && !booking && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm bg-[var(--primary)] text-white hover:bg-[#0A5C4A] transition-colors disabled:opacity-50"
            >
              {loading
                ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("lookup_searching")}</>
                : <><RiSearchLine className="w-4 h-4" /> {t("lookup_cta")}</>
              }
            </button>
          </motion.form>

          {/* ── Result ── */}
          <AnimatePresence>
            {booking && cfg && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 mt-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <Link
                      href={`/listing/${booking.listingSlug}`}
                      className="font-semibold text-lg hover:text-[var(--primary)] transition-colors"
                    >
                      {booking.listingName}
                    </Link>
                    <p className="text-[var(--muted-foreground)] text-xs mt-0.5 font-mono tracking-wider">
                      {booking.ref}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {t(cfg.label)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm pt-1">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <RiCalendarLine className="w-4 h-4 shrink-0 text-[var(--primary)]" />
                    <span className="text-xs">{booking.dates}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <RiTeamLine className="w-4 h-4 shrink-0 text-[var(--primary)]" />
                    <span className="text-xs">
                      {booking.guests}{" "}
                      {booking.guests !== 1 ? t("guest_plural") : t("guest_singular")}
                    </span>
                  </div>
                </div>

                {booking.status === "cancelled" && booking.cancellationReason && (
                  <p className="text-xs text-[var(--muted-foreground)] bg-[var(--secondary)] rounded-xl p-3">
                    {t("lookup_reason")}: {booking.cancellationReason}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">{t("total")}</p>
                    <p className="font-bold text-[var(--primary)] text-base">{fmt(booking.totalXaf)}</p>
                  </div>
                  {booking.businessPhone && (
                    <a
                      href={`tel:${booking.businessPhone}`}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                    >
                      <RiPhoneLine className="w-3.5 h-3.5" />
                      {t("lookup_call_venue")}
                    </a>
                  )}
                </div>

                {/* Cancellation */}
                {booking.canCancel && !confirmingCancel && (
                  <button
                    onClick={() => setConfirmingCancel(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors"
                  >
                    <RiCloseCircleFill className="w-3.5 h-3.5" />
                    {t("cancel_booking")}
                  </button>
                )}

                {confirmingCancel && (
                  <div className="border-t border-[var(--border)] pt-4 space-y-3">
                    <p className="text-sm font-semibold">{t("cancel_confirm_title")}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{t("cancel_confirm_body")}</p>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder={t("cancel_reason_ph")}
                      maxLength={200}
                      className="input-field w-full text-sm"
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setConfirmingCancel(false); setError(""); setCancelReason(""); }}
                        disabled={cancelling}
                        className="px-4 py-2 text-xs rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors disabled:opacity-50"
                      >
                        {t("cancel_keep")}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {cancelling
                          ? <><RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> {t("cancelling")}</>
                          : <><RiCloseCircleFill className="w-3.5 h-3.5" /> {t("cancel_confirm_cta")}</>
                        }
                      </button>
                    </div>
                  </div>
                )}

                <Link
                  href={`/listing/${booking.listingSlug}`}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {t("view_listing")}
                  <RiArrowRightLine className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <NewFooter />
    </>
  );
}
