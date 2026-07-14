"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiSearchLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiCalendarLine,
  RiMapPinLine,
  RiTeamLine,
  RiMoneyDollarCircleLine,
  RiPhoneLine,
  RiMailLine,
  RiTimeLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiTimer2Line,
  RiStarLine,
  RiInformationLine,
} from "react-icons/ri";
import { updateBookingStatus, type PartnerBooking, type BookingStatusUpdate } from "@/actions/bookings";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReservationsManagerProps {
  initialBookings: PartnerBooking[];
  userId: string;
}

type FilterTab = "all" | "pending" | "confirmed" | "cancelled" | "completed";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-CM").format(Math.round(n)) + " XAF";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#13695A", "#0A5C4A", "#E8B923", "#2D6A4F", "#1F2A2A", "#B7791F"];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

const PAYMENT_LABELS: Record<string, string> = {
  "mtn-momo": "MTN MoMo",
  "orange-money": "Orange Money",
};

function paymentLabel(method: string, t: (key: TranslationKey) => string): string {
  if (method === "card") return t("pay_card");
  if (method === "cash") return t("cash_on_arrival");
  return PAYMENT_LABELS[method] ?? method;
}

const STATUS_CONFIG: Record<string, { label: TranslationKey; icon: typeof RiCheckboxCircleFill; bg: string; text: string }> = {
  pending: { label: "status_pending", icon: RiTimer2Line, bg: "bg-amber-100", text: "text-amber-700" },
  confirmed: { label: "status_confirmed", icon: RiCheckboxCircleFill, bg: "bg-green-100", text: "text-green-700" },
  cancelled: { label: "status_cancelled", icon: RiCloseCircleFill, bg: "bg-red-100", text: "text-red-600" },
  completed: { label: "status_completed", icon: RiStarLine, bg: "bg-blue-100", text: "text-blue-700" },
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {t(cfg.label)}
    </span>
  );
}

function formatDateRange(booking: PartnerBooking): string {
  if (booking.checkIn && booking.checkOut) {
    return `${booking.checkIn} → ${booking.checkOut}`;
  }
  if (booking.checkIn) return booking.checkIn;
  if (booking.bookingDate) {
    return booking.bookingTime
      ? `${booking.bookingDate} · ${booking.bookingTime}`
      : booking.bookingDate;
  }
  return "—";
}

function nightCount(checkIn: string | null, checkOut: string | null): number | null {
  if (!checkIn || !checkOut) return null;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(ms / 86_400_000);
}

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onUpdateStatus,
}: {
  booking: PartnerBooking & { _updating?: string | null };
  onUpdateStatus: (id: string, status: BookingStatusUpdate) => Promise<void>;
}) {
  const { t, lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const nights = nightCount(booking.checkIn, booking.checkOut);

  async function handleAction(status: BookingStatusUpdate) {
    setLoadingAction(status);
    await onUpdateStatus(booking.id, status);
    setLoadingAction(null);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#1F2A2A]/8 rounded-xl shadow-[0_1px_2px_rgba(31,42,42,0.04),0_6px_20px_rgba(31,42,42,0.04)] overflow-hidden hover:border-[#1F2A2A]/20 transition-colors"
    >
      {/* ── Main row ── */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start gap-4 p-5 text-left"
      >
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: avatarColor(booking.guestName) }}
        >
          {getInitials(booking.guestName)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold text-[#1F2A2A] text-sm leading-tight">
                {booking.guestName}
              </p>
              <p className="text-[#1F2A2A]/50 text-xs mt-0.5 truncate">
                {booking.listingName}
                {nights ? ` · ${nights} ${nights !== 1 ? t("nights") : t("night")}` : ""}
                {` · ${booking.guests} ${booking.guests !== 1 ? t("guest_plural") : t("guest_singular")}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={booking.status} />
              {expanded
                ? <RiArrowUpSLine className="w-4 h-4 text-[#1F2A2A]/40" />
                : <RiArrowDownSLine className="w-4 h-4 text-[#1F2A2A]/40" />
              }
            </div>
          </div>

          {/* Quick stats row */}
          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <span className="flex items-center gap-1 text-[#1F2A2A]/60 text-xs">
              <RiCalendarLine className="w-3.5 h-3.5" />
              {formatDateRange(booking)}
            </span>
            <span className="font-semibold text-[#1F2A2A] text-sm">
              {fmt(booking.totalXaf)}
            </span>
            <span className="text-[#1F2A2A]/50 text-xs">
              {paymentLabel(booking.paymentMethod, t)}
            </span>
          </div>
        </div>
      </button>

      {/* ── Expanded detail ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[#1F2A2A]/10 pt-4 space-y-4">

              {/* Guest contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#F8F1EA] rounded-xl p-3 space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#1F2A2A]/35">
                    {t("res_guest_contact")}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#1F2A2A]/70">
                    <RiPhoneLine className="w-3.5 h-3.5 shrink-0" />
                    {booking.guestPhone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1F2A2A]/70">
                    <RiMailLine className="w-3.5 h-3.5 shrink-0" />
                    {booking.guestEmail}
                  </div>
                </div>

                {/* Booking details */}
                <div className="bg-[#F8F1EA] rounded-xl p-3 space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#1F2A2A]/35">
                    {t("booking_details")}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#1F2A2A]/70">
                    <RiMapPinLine className="w-3.5 h-3.5 shrink-0" />
                    {booking.listingName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1F2A2A]/70">
                    <RiTeamLine className="w-3.5 h-3.5 shrink-0" />
                    {booking.guests} {booking.guests !== 1 ? t("guest_plural") : t("guest_singular")}
                    {nights ? ` · ${nights} ${nights !== 1 ? t("nights") : t("night")}` : ""}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1F2A2A]/70">
                    <RiTimeLine className="w-3.5 h-3.5 shrink-0" />
                    {formatDateRange(booking)}
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-[#F8F1EA] rounded-xl p-3 flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#1F2A2A]/35">
                    {t("res_payment")}
                  </p>
                  <p className="text-xs text-[#1F2A2A]/60">
                    {paymentLabel(booking.paymentMethod, t)}
                    {" · "}
                    <span className={`font-medium ${
                      booking.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"
                    }`}>
                      {booking.paymentStatus === "paid" ? t("res_paid") : t("res_payment_pending")}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#1F2A2A]/35">
                    {t("total")}
                  </p>
                  <p className="text-lg font-bold text-[#1F2A2A] tracking-tight">
                    {fmt(booking.totalXaf)}
                  </p>
                  {booking.serviceFeeXaf > 0 && (
                    <p className="text-[10px] text-[#1F2A2A]/40">
                      {t("res_fee_incl_pre")} {fmt(booking.serviceFeeXaf)} {t("res_fee_incl_post")}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="bg-[#F8F1EA] rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#1F2A2A]/35 mb-1.5">
                    {t("res_guest_notes")}
                  </p>
                  <p className="text-xs text-[#1F2A2A]/70 leading-relaxed">{booking.notes}</p>
                </div>
              )}

              {/* Booking ID + timestamp */}
              <div className="flex items-center gap-1.5 text-[10px] text-[#1F2A2A]/30">
                <RiInformationLine className="w-3 h-3" />
                ID: {booking.id.slice(0, 8).toUpperCase()} ·{" "}
                {new Date(booking.createdAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-1">
                {booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleAction("cancelled")}
                      disabled={loadingAction !== null}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {loadingAction === "cancelled"
                        ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                        : <RiCloseLine className="w-3.5 h-3.5" />
                      }
                      {t("res_reject")}
                    </button>
                    <button
                      onClick={() => handleAction("confirmed")}
                      disabled={loadingAction !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#13695A] hover:bg-[#0A5C4A] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {loadingAction === "confirmed"
                        ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                        : <RiCheckLine className="w-3.5 h-3.5" />
                      }
                      {t("res_confirm_booking")}
                    </button>
                  </>
                )}

                {booking.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => handleAction("cancelled")}
                      disabled={loadingAction !== null}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1F2A2A]/15 text-[#1F2A2A]/60 hover:bg-[#1F2A2A]/5 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {loadingAction === "cancelled"
                        ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                        : <RiCloseLine className="w-3.5 h-3.5" />
                      }
                      {t("cancel")}
                    </button>
                    <button
                      onClick={() => handleAction("completed")}
                      disabled={loadingAction !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {loadingAction === "completed"
                        ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                        : <RiStarLine className="w-3.5 h-3.5" />
                      }
                      {t("res_mark_completed")}
                    </button>
                  </>
                )}

                {(booking.status === "cancelled" || booking.status === "completed") && (
                  <p className="text-xs text-[#1F2A2A]/35 italic">
                    {t("res_no_actions")}
                  </p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReservationsManager({ initialBookings, userId }: ReservationsManagerProps) {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<PartnerBooking[]>(initialBookings);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  // Count per tab
  const counts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  }), [bookings]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = bookings;
    if (activeTab !== "all") list = list.filter((b) => b.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.guestEmail.toLowerCase().includes(q) ||
          b.guestPhone.includes(q) ||
          b.listingName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, activeTab, search]);

  async function handleUpdateStatus(id: string, status: BookingStatusUpdate) {
    const result = await updateBookingStatus(id, userId, status);
    if (result.success) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    }
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: t("tab_all") },
    { key: "pending", label: t("status_pending") },
    { key: "confirmed", label: t("status_confirmed") },
    { key: "cancelled", label: t("status_cancelled") },
    { key: "completed", label: t("status_completed") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2A2A] mb-1">{t("dash_bookings")}</h1>
        <p className="text-[#1F2A2A]/50 text-sm">
          {counts.all} {t("res_total_label")} · {counts.pending} {t("status_pending").toLowerCase()} · {counts.confirmed} {t("status_confirmed").toLowerCase()} · {counts.cancelled} {t("status_cancelled").toLowerCase()}
        </p>
      </div>

      {/* ── Filter tabs + search ── */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-[#1F2A2A]/8 rounded-xl p-1 flex-wrap">
          {TABS.map((tab) => {
            const count = counts[tab.key];
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#1F2A2A] text-white shadow-sm"
                    : "text-[#1F2A2A]/55 hover:text-[#1F2A2A] hover:bg-[#1F2A2A]/5"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active
                      ? tab.key === "pending" ? "bg-[#E8B923] text-[#1F2A2A]" : "bg-white/20 text-white"
                      : tab.key === "pending" ? "bg-[#E8B923] text-[#1F2A2A]" : "bg-[#1F2A2A]/10 text-[#1F2A2A]"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/40" />
          <input
            type="text"
            placeholder={t("res_search_ph")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs bg-white border border-[#1F2A2A]/8 rounded-xl text-[#1F2A2A] placeholder:text-[#1F2A2A]/30 focus:outline-none focus:ring-2 focus:ring-[#13695A] focus:border-[#13695A] transition-all w-56 focus:w-72"
          />
        </div>
      </div>

      {/* ── Bookings list ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#1F2A2A]/8 rounded-xl shadow-[0_1px_2px_rgba(31,42,42,0.04),0_6px_20px_rgba(31,42,42,0.04)] p-16 text-center">
          <div className="w-14 h-14 bg-[#1F2A2A]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RiCalendarLine className="w-7 h-7 text-[#1F2A2A]/30" />
          </div>
          <p className="font-semibold text-[#1F2A2A]/60 text-sm mb-1">
            {counts.all === 0 ? t("res_none_yet") : t("res_none_in_tab")}
          </p>
          <p className="text-xs text-[#1F2A2A]/35">
            {counts.all === 0
              ? t("res_will_appear")
              : search
              ? t("res_try_different")
              : t("res_nothing_here")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
