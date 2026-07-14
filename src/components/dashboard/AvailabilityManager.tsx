"use client";

import { useState, useCallback, useTransition } from "react";
import { motion } from "motion/react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiLoader4Line,
  RiInformationLine,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";
import {
  toggleDateBlocked,
  blockDateRange,
  unblockDateRange,
  getListingAvailability,
  getBookedDates,
} from "@/actions/availability";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvailabilityManagerProps {
  userId: string;
  listings: { id: string; name: string; category: string }[];
  initialListingId: string | null;
  initialBlockedDates: string[];
  initialBookedDates: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isTodayOrFuture(dateStr: string): boolean {
  return dateStr >= toDateStr(new Date());
}

const DAY_LABELS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_LABELS_FR = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

const CATEGORY_COLORS: Record<string, string> = {
  "food-drinks": "bg-amber-100 text-amber-700",
  nightlife: "bg-purple-100 text-purple-700",
  "beauty-wellness": "bg-pink-100 text-pink-700",
  "events-venues": "bg-blue-100 text-blue-700",
  accommodation: "bg-teal-100 text-[#13695A]",
  "transport-more": "bg-green-100 text-green-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AvailabilityManager({
  userId,
  listings,
  initialListingId,
  initialBlockedDates,
  initialBookedDates,
}: AvailabilityManagerProps) {
  const { t, lang } = useLanguage();
  const today = toDateStr(new Date());

  const [selectedId, setSelectedId] = useState<string | null>(initialListingId);
  const [blocked, setBlocked] = useState<Set<string>>(new Set(initialBlockedDates));
  const [booked, setBooked] = useState<Set<string>>(new Set(initialBookedDates));
  const [togglingDate, setTogglingDate] = useState<string | null>(null);
  const [loadingListing, startListingTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Range block UI
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeAction, setRangeAction] = useState<"block" | "unblock">("block");
  const [rangeLoading, setRangeLoading] = useState(false);

  // Month view
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  // ── Listing change ────────────────────────────────────────────────────────

  function handleListingChange(id: string) {
    setSelectedId(id);
    startListingTransition(async () => {
      const [b, bk] = await Promise.all([
        getListingAvailability(id),
        getBookedDates(id),
      ]);
      setBlocked(new Set(b));
      setBooked(new Set(bk));
    });
  }

  // ── Single date toggle ────────────────────────────────────────────────────

  const handleDateClick = useCallback(
    async (dateStr: string) => {
      if (!selectedId) return;
      if (!isTodayOrFuture(dateStr)) return; // past dates — not interactive
      if (booked.has(dateStr)) return; // real booking — can't change
      if (togglingDate) return; // already busy

      setTogglingDate(dateStr);
      setFeedback(null);

      const result = await toggleDateBlocked(selectedId, userId, dateStr);

      setTogglingDate(null);

      if (result.success) {
        setBlocked((prev) => {
          const next = new Set(prev);
          if (result.isNowBlocked) next.add(dateStr);
          else next.delete(dateStr);
          return next;
        });
      } else {
        setFeedback({ type: "error", msg: result.error ?? t("av_update_failed") });
      }
    },
    [selectedId, userId, booked, togglingDate]
  );

  // ── Range block ───────────────────────────────────────────────────────────

  async function handleRangeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !rangeStart || !rangeEnd) return;
    setRangeLoading(true);
    setFeedback(null);

    const result =
      rangeAction === "block"
        ? await blockDateRange(selectedId, userId, rangeStart, rangeEnd)
        : await unblockDateRange(selectedId, userId, rangeStart, rangeEnd);

    setRangeLoading(false);

    if (result.success) {
      // Refresh full availability
      const b = await getListingAvailability(selectedId);
      setBlocked(new Set(b));
      setFeedback({
        type: "success",
        msg: rangeAction === "block" ? t("av_blocked_success") : t("av_unblocked_success"),
      });
      setRangeStart("");
      setRangeEnd("");
    } else {
      setFeedback({ type: "error", msg: result.error ?? t("av_failed") });
    }
  }

  // ── Month navigation ──────────────────────────────────────────────────────

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  // ── Build calendar days ───────────────────────────────────────────────────

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth).toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
    month: "long",
    year: "numeric",
  });

  // ── Render ────────────────────────────────────────────────────────────────

  const selectedListing = listings.find((l) => l.id === selectedId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2A2A] mb-1">{t("dash_availability")}</h1>
        <p className="text-[#1F2A2A]/50 text-sm">
          {t("av_subtitle")}
        </p>
      </div>

      {/* No listings state */}
      {listings.length === 0 && (
        <div className="bg-white border border-[#1F2A2A]/8 rounded-xl shadow-[0_1px_2px_rgba(31,42,42,0.04),0_6px_20px_rgba(31,42,42,0.04)] p-16 text-center">
          <RiCalendarLine className="w-10 h-10 text-[#1F2A2A]/20 mx-auto mb-3" />
          <p className="font-semibold text-[#1F2A2A]/50 text-sm mb-1">{t("av_no_listings_title")}</p>
          <p className="text-xs text-[#1F2A2A]/35">
            {t("av_no_listings_sub")}
          </p>
        </div>
      )}

      {listings.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

          {/* ── Left: Calendar ── */}
          <div className="space-y-4">

            {/* Listing selector */}
            <div className="bg-white border border-[#1F2A2A]/8 rounded-xl shadow-[0_1px_2px_rgba(31,42,42,0.04),0_6px_20px_rgba(31,42,42,0.04)] p-4 flex items-center gap-4 flex-wrap">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1F2A2A]/40 shrink-0">
                {t("av_listing_label")}
              </p>
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedId ?? ""}
                  onChange={(e) => handleListingChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#1F2A2A]/12 bg-[#F8F1EA] text-[#1F2A2A] text-sm focus:outline-none focus:ring-2 focus:ring-[#13695A] transition-all"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              {selectedListing && (
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${CATEGORY_COLORS[selectedListing.category] ?? "bg-gray-100 text-gray-600"}`}>
                  {selectedListing.category.replace(/-/g, " ")}
                </span>
              )}
              {loadingListing && <RiLoader4Line className="w-4 h-4 text-[#13695A] animate-spin shrink-0" />}
            </div>

            {/* Calendar */}
            <div className="bg-white border border-[#1F2A2A]/8 rounded-xl shadow-[0_1px_2px_rgba(31,42,42,0.04),0_6px_20px_rgba(31,42,42,0.04)] p-5">

              {/* Month nav */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={prevMonth}
                  className="w-9 h-9 rounded-xl hover:bg-[#1F2A2A]/8 flex items-center justify-center text-[#1F2A2A]/55 hover:text-[#1F2A2A] transition-colors"
                >
                  <RiArrowLeftSLine className="w-5 h-5" />
                </button>
                <h3 className="text-[#1F2A2A] font-semibold text-base tracking-tight capitalize">
                  {monthName}
                </h3>
                <button
                  onClick={nextMonth}
                  className="w-9 h-9 rounded-xl hover:bg-[#1F2A2A]/8 flex items-center justify-center text-[#1F2A2A]/55 hover:text-[#1F2A2A] transition-colors"
                >
                  <RiArrowRightSLine className="w-5 h-5" />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-1">
                {(lang === "fr" ? DAY_LABELS_FR : DAY_LABELS_EN).map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-[#1F2A2A]/30 py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Offset blank cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isPast = dateStr < today;
                  const isToday = dateStr === today;
                  const isBooked = booked.has(dateStr);
                  const isBlocked = blocked.has(dateStr);
                  const isToggling = togglingDate === dateStr;

                  let cellCls = "";
                  let title = "";

                  if (isToggling) {
                    cellCls = "bg-[#1F2A2A]/20 animate-pulse cursor-wait";
                    title = t("av_tip_updating");
                  } else if (isToday) {
                    cellCls = isBooked
                      ? "bg-[#13695A] text-white font-bold ring-2 ring-[#E8B923] cursor-not-allowed"
                      : isBlocked
                      ? "bg-red-400 text-white font-bold ring-2 ring-[#E8B923] cursor-pointer hover:bg-red-500"
                      : "bg-[#E8B923] text-[#1F2A2A] font-bold cursor-pointer hover:bg-[#E8B923]/80";
                    title = isBooked ? t("av_tip_booked") : isBlocked ? t("av_tip_today_blocked") : t("av_tip_today_block");
                  } else if (isPast) {
                    cellCls = "text-[#1F2A2A]/20 cursor-not-allowed select-none";
                    title = t("av_tip_past");
                  } else if (isBooked) {
                    cellCls = "bg-[#13695A]/15 text-[#13695A] font-semibold cursor-not-allowed";
                    title = t("av_tip_booked");
                  } else if (isBlocked) {
                    cellCls = "bg-red-100 text-red-600 line-through cursor-pointer hover:bg-red-200 transition-colors";
                    title = t("av_tip_blocked");
                  } else {
                    cellCls = "text-[#1F2A2A]/70 hover:bg-[#13695A]/10 hover:text-[#13695A] cursor-pointer transition-colors";
                    title = t("av_tip_available");
                  }

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      title={title}
                      disabled={isPast || isBooked || isToggling || loadingListing}
                      onClick={() => handleDateClick(dateStr)}
                      className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium relative ${cellCls} disabled:pointer-events-none`}
                    >
                      {day}
                      {isBooked && !isToday && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#13695A] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 mt-5 pt-4 border-t border-[#1F2A2A]/8 flex-wrap">
                {[
                  { color: "bg-[#1F2A2A]/8", label: t("av_legend_available") },
                  { color: "bg-red-100", label: t("av_legend_blocked") },
                  { color: "bg-[#13695A]/15", label: t("av_legend_booked") },
                  { color: "bg-[#E8B923]", label: t("av_legend_today") },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-4 h-4 rounded-md ${color}`} />
                    <span className="text-[10px] font-medium text-[#1F2A2A]/50">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Stats + Range block ── */}
          <div className="space-y-4">

            {/* Monthly stats */}
            <div className="bg-white border border-[#1F2A2A]/8 rounded-xl shadow-[0_1px_2px_rgba(31,42,42,0.04),0_6px_20px_rgba(31,42,42,0.04)] p-5 space-y-3">
              <h3 className="text-[#1F2A2A] font-semibold text-sm tracking-tight capitalize">
                {monthName}
              </h3>

              {[
                {
                  label: t("av_days_in_month"),
                  value: daysInMonth,
                  color: "text-[#1F2A2A]",
                },
                {
                  label: t("av_legend_blocked"),
                  value: Array.from(blocked).filter((d) => {
                    const [y, m] = d.split("-").map(Number);
                    return y === viewYear && m === viewMonth + 1;
                  }).length,
                  color: "text-red-600",
                },
                {
                  label: t("av_legend_booked"),
                  value: Array.from(booked).filter((d) => {
                    const [y, m] = d.split("-").map(Number);
                    return y === viewYear && m === viewMonth + 1;
                  }).length,
                  color: "text-[#13695A]",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#1F2A2A]/8 last:border-0">
                  <p className="text-xs text-[#1F2A2A]/55">{label}</p>
                  <p className={`text-sm font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Range block / unblock */}
            <div className="bg-white border border-[#1F2A2A]/8 rounded-xl shadow-[0_1px_2px_rgba(31,42,42,0.04),0_6px_20px_rgba(31,42,42,0.04)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1F2A2A] font-semibold text-sm tracking-tight">
                  {t("av_range_title")}
                </h3>
                <button
                  type="button"
                  onClick={() => setRangeMode((r) => !r)}
                  className="text-xs text-[#13695A] font-semibold hover:underline"
                >
                  {rangeMode ? t("cancel") : t("av_use_range")}
                </button>
              </div>

              {!rangeMode ? (
                <p className="text-xs text-[#1F2A2A]/40 leading-relaxed">
                  {t("av_range_desc")}
                </p>
              ) : (
                <form onSubmit={handleRangeSubmit} className="space-y-3">
                  {/* Action toggle */}
                  <div className="flex gap-2">
                    {(["block", "unblock"] as const).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setRangeAction(a)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                          rangeAction === a
                            ? a === "block"
                              ? "bg-red-500 text-white"
                              : "bg-[#13695A] text-white"
                            : "border border-[#1F2A2A]/15 text-[#1F2A2A]/55 hover:bg-[#1F2A2A]/5"
                        }`}
                      >
                        {a === "block" ? t("av_block_range") : t("av_unblock_range")}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1F2A2A]/40 mb-1">
                      {t("av_from")}
                    </label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#1F2A2A]/12 bg-[#F8F1EA] text-[#1F2A2A] text-sm focus:outline-none focus:ring-2 focus:ring-[#13695A] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1F2A2A]/40 mb-1">
                      {t("av_to")}
                    </label>
                    <input
                      type="date"
                      required
                      min={rangeStart || today}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#1F2A2A]/12 bg-[#F8F1EA] text-[#1F2A2A] text-sm focus:outline-none focus:ring-2 focus:ring-[#13695A] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={rangeLoading || !rangeStart || !rangeEnd}
                    className={`w-full py-2.5 rounded-xl text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                      rangeAction === "block"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-[#13695A] hover:bg-[#0A5C4A]"
                    }`}
                  >
                    {rangeLoading
                      ? <><RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> {t("processing")}</>
                      : rangeAction === "block"
                      ? <><RiCloseLine className="w-3.5 h-3.5" /> {t("av_block_dates")}</>
                      : <><RiCheckLine className="w-3.5 h-3.5" /> {t("av_unblock_dates")}</>
                    }
                  </button>
                </form>
              )}
            </div>

            {/* Feedback */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium border ${
                  feedback.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                <RiInformationLine className="w-4 h-4 shrink-0" />
                {feedback.msg}
              </motion.div>
            )}

            {/* Info box */}
            <div className="bg-[#F8F1EA] border border-[#1F2A2A]/8 rounded-2xl p-4">
              <div className="flex items-start gap-2.5">
                <RiInformationLine className="w-4 h-4 text-[#1F2A2A]/35 shrink-0 mt-0.5" />
                <p className="text-[10.5px] text-[#1F2A2A]/45 leading-relaxed">
                  {t("av_info")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
