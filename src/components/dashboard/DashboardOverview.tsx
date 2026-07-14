"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RiArrowUpLine, RiArrowDownLine, RiCalendarEventLine,
  RiBankCardLine, RiEyeLine, RiStoreLine, RiSearchLine,
  RiCheckboxCircleFill, RiCloseCircleFill,
  RiTimer2Line, RiArrowRightUpLine, RiCameraLine,
  RiChat3Line, RiMegaphoneLine, RiFileList3Line, RiWalletLine,
  RiCheckLine, RiArrowRightLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils";
import type { DashboardStats, RecentBooking } from "@/actions/dashboard";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardOverviewProps {
  stats: DashboardStats;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat("fr-CM").format(Math.round(n)) + " XAF";

// Shared card surface for the whole dashboard
const CARD = "bg-white border border-[#1F2A2A]/8 rounded-xl shadow-[0_1px_2px_rgba(31,42,42,0.04),0_6px_20px_rgba(31,42,42,0.04)]";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#13695A", "#0A5C4A", "#E8B923", "#1F2A2A", "#2D6A4F", "#B7791F"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const s = status as BookingStatus;
  const map: Record<BookingStatus, { label: TranslationKey; Icon: typeof RiCheckboxCircleFill; cls: string }> = {
    confirmed: { label: "status_confirmed", Icon: RiCheckboxCircleFill, cls: "bg-[#13695A]/10 text-[#13695A]" },
    completed: { label: "status_completed", Icon: RiCheckboxCircleFill, cls: "bg-[#13695A]/10 text-[#13695A]" },
    pending:   { label: "status_pending",   Icon: RiTimer2Line,         cls: "bg-[#E8B923]/15 text-[#9C7A0A]" },
    cancelled: { label: "status_cancelled", Icon: RiCloseCircleFill,    cls: "bg-[#1F2A2A]/8 text-[#1F2A2A]/70" },
  };
  const m = map[s] ?? map.pending;
  const Icon = m.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-1 rounded-full", m.cls)}>
      <Icon size={12} />{t(m.label)}
    </span>
  );
}

const QUICK_ACTIONS: { Icon: React.ElementType; label: TranslationKey; href: string | null; comingSoon: boolean }[] = [
  { Icon: RiCameraLine,    label: "qa_update_photos", href: "/dashboard/listings",     comingSoon: false },
  { Icon: RiTimer2Line,    label: "qa_edit_profile",  href: "/dashboard/settings",     comingSoon: false },
  { Icon: RiChat3Line,     label: "qa_view_bookings", href: "/dashboard/reservations", comingSoon: false },
  { Icon: RiFileList3Line, label: "qa_edit_listing",  href: "/dashboard/listings",     comingSoon: false },
  { Icon: RiMegaphoneLine, label: "qa_run_promo",     href: null,                      comingSoon: true  },
  { Icon: RiWalletLine,    label: "qa_withdraw",      href: null,                      comingSoon: true  },
];

// ─── Onboarding checklist — steps auto-detect from real DB data ───────────────

function OnboardingChecklist({ stats }: { stats: DashboardStats }) {
  const { t } = useLanguage();
  const steps = [
    {
      done: true,  // account creation always done by the time they see this
      label: t("ov_step_account"),
      sub: t("ov_step_account_sub"),
      href: null,
      cta: null,
    },
    {
      done: stats.totalListings > 0,
      label: t("ov_step_listing"),
      sub: t("ov_step_listing_sub"),
      href: "/dashboard/listings",
      cta: t("ov_step_listing_cta"),
    },
    {
      done: stats.hasPhotos,
      label: t("ov_step_photos"),
      sub: t("ov_step_photos_sub"),
      href: "/dashboard/listings",
      cta: t("ov_step_photos_cta"),
    },
    {
      done: stats.hasAvailabilitySet,
      label: t("ov_step_avail"),
      sub: t("ov_step_avail_sub"),
      href: "/dashboard/availability",
      cta: t("ov_step_avail_cta"),
    },
    {
      done: stats.hasProfileComplete,
      label: t("ov_step_profile"),
      sub: t("ov_step_profile_sub"),
      href: "/dashboard/settings",
      cta: t("ov_step_profile_cta"),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={cn(CARD, "p-6 mb-6")}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-[#1F2A2A] font-semibold text-lg tracking-tight mb-0.5">
            {t("ov_welcome_title")}
          </h2>
          <p className="text-[#1F2A2A]/50 text-xs">
            {t("ov_welcome_sub")}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[#1F2A2A]/40 text-xs mb-1">{completedCount}/{steps.length} {t("ov_complete")}</p>
          <div className="w-32 h-1.5 bg-[#1F2A2A]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#13695A] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-3.5 rounded-lg transition-colors ${
              step.done
                ? "bg-[#13695A]/6"
                : "bg-[#F5F1EB] hover:bg-[#F0EAE1]"
            }`}
          >
            {/* Check circle */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              step.done ? "bg-[#13695A]" : "border-2 border-[#1F2A2A]/15 bg-white"
            }`}>
              {step.done && <RiCheckLine className="w-3.5 h-3.5 text-white" />}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-tight ${
                step.done ? "text-[#13695A] line-through" : "text-[#1F2A2A]"
              }`}>
                {step.label}
              </p>
              <p className="text-[#1F2A2A]/45 text-xs mt-0.5 leading-snug">{step.sub}</p>
            </div>

            {/* CTA */}
            {!step.done && step.href && (
              <Link
                href={step.href}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#13695A] hover:text-[#0A5C4A] transition-colors whitespace-nowrap"
              >
                {step.cta}
                <RiArrowRightLine className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Overview component ────────────────────────────────────────────────────────

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  // Show checklist until all 5 setup steps are complete
  const isNewPartner =
    stats.totalListings === 0 ||
    !stats.hasPhotos ||
    !stats.hasAvailabilitySet ||
    !stats.hasProfileComplete;

  const filteredBookings = search.trim()
    ? stats.recentBookings.filter((b) =>
        b.guestName.toLowerCase().includes(search.toLowerCase()) ||
        b.listingName.toLowerCase().includes(search.toLowerCase())
      )
    : stats.recentBookings;

  return (
    <div>
      {/* Onboarding checklist — shown when setup is incomplete */}
      {isNewPartner && <OnboardingChecklist stats={stats} />}

      {/* Stat cards — shown once partner has listings */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 ${isNewPartner ? "opacity-40 pointer-events-none select-none" : ""}`}>
        {[
          {
            label: t("ov_today_bookings"),
            value: stats.todayBookings.toString(),
            suffix: "",
            sub: stats.todayBookings > 0 ? t("ov_bookings_for_today") : t("ov_no_bookings_today"),
            trend: stats.todayBookings > 0 ? "up" : "neutral",
            Icon: RiCalendarEventLine,
          },
          {
            label: t("ov_total_revenue"),
            value: new Intl.NumberFormat("fr-CM").format(stats.totalRevenueXaf),
            suffix: "XAF",
            sub: t("ov_from_confirmed"),
            trend: stats.totalRevenueXaf > 0 ? "up" : "neutral",
            Icon: RiBankCardLine,
          },
          {
            label: t("dash_my_listings"),
            value: stats.totalListings.toString(),
            suffix: "",
            sub: `${stats.activeListings} ${t("ov_active")} · ${stats.totalListings - stats.activeListings} ${t("ov_inactive")}`,
            trend: "neutral",
            Icon: RiStoreLine,
          },
          {
            label: t("ov_pending_bookings"),
            value: stats.pendingBookings.toString(),
            suffix: "",
            sub: stats.pendingBookings > 0 ? t("ov_awaiting") : t("ov_all_up_to_date"),
            trend: stats.pendingBookings > 0 ? "down" : "neutral",
            Icon: RiEyeLine,
          },
        ].map((s, i) => {
          const Icon = s.Icon;
          return (
            <div key={i} className={cn(CARD, "p-5 hover:border-[#1F2A2A]/16 transition-colors")}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10.5px] font-semibold tracking-[0.8px] uppercase text-[#1F2A2A]/50">{s.label}</p>
                <div className="w-9 h-9 rounded-lg bg-[#13695A]/8 flex items-center justify-center">
                  <Icon size={17} className="text-[#13695A]" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl font-bold text-[#1F2A2A] tracking-tight">{s.value}</span>
                {s.suffix && <span className="text-sm font-semibold text-[#1F2A2A]/50">{s.suffix}</span>}
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-medium",
                s.trend === "up" ? "text-[#13695A]" : s.trend === "down" ? "text-amber-600" : "text-[#1F2A2A]/50"
              )}>
                {s.trend === "up"   && <RiArrowUpLine   size={12} />}
                {s.trend === "down" && <RiArrowDownLine size={12} />}
                {s.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

        {/* LEFT: chart + recent bookings */}
        <div className="space-y-5 min-w-0">

          {/* Weekly bookings chart */}
          <div className={cn(CARD, "p-6")}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <p className="text-xs text-[#1F2A2A]/50">{t("ov_last_7_days")}</p>
                <h3 className="text-[#1F2A2A] font-semibold text-lg tracking-tight">
                  {t("ov_bookings_overview")}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#1F2A2A]/50">{t("ov_total_this_week")}</div>
                <div className="text-[#1F2A2A] font-bold text-2xl tracking-tight">
                  {stats.weeklyData.reduce((s, d) => s + d.bookings, 0)}
                </div>
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-24">
              {stats.weeklyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center h-full group relative">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      style={{ height: d.h > 0 ? `${Math.max(d.h, 8)}%` : "4px" }}
                      className={`w-full rounded-t-md transition-all ${
                        d.h > 0 ? "bg-[#13695A] group-hover:bg-[#0A5C4A]" : "bg-[#1F2A2A]/8"
                      }`}
                    />
                  </div>
                  {d.bookings > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1F2A2A] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {d.bookings} {d.bookings !== 1 ? t("booking_plural") : t("booking_singular")}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {stats.weeklyData.map((d) => (
                <div key={d.day} className="flex-1 text-center text-[9px] text-[#1F2A2A]/35 font-medium">{d.day}</div>
              ))}
            </div>
          </div>

          {/* Recent bookings */}
          <div className={cn(CARD, "p-6")}>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h3 className="text-[#1F2A2A] font-semibold text-base tracking-tight">
                {t("ov_recent_bookings")}
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1F2A2A]/45" size={13} />
                  <input
                    placeholder={t("search_label")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-[#F5F1EB] text-[#1F2A2A]/85 placeholder:text-[#1F2A2A]/30 rounded-lg pl-9 pr-4 py-2 text-xs outline-none w-44 border border-transparent focus:border-[#13695A]/30 focus:bg-white focus:w-56 transition-all"
                  />
                </div>
                <Link href="/dashboard/reservations" className="text-xs text-[#13695A] hover:text-[#0A5C4A] font-semibold">
                  {t("ov_view_all")}
                </Link>
              </div>
            </div>
            {filteredBookings.length === 0 ? (
              <div className="py-10 text-center text-[#1F2A2A]/40 text-sm">
                {stats.recentBookings.length === 0
                  ? t("ov_no_bookings_yet")
                  : t("ov_no_match")}
              </div>
            ) : (
              <div className="divide-y divide-[#1F2A2A]/6">
                {filteredBookings.map((b) => <BookingRow key={b.id} booking={b} />)}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: calendar + quick actions + revenue */}
        <div className="flex flex-col gap-5">

          <MiniCalendar />

          <div className={cn(CARD, "p-5")}>
            <h3 className="text-[#1F2A2A] font-semibold text-sm tracking-tight mb-3">
              {t("ov_quick_actions")}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map(({ Icon, label, href, comingSoon }) => {
                const baseCls = `relative flex items-center gap-2 p-3 rounded-lg border transition-all text-left group ${
                  comingSoon
                    ? "border-[#1F2A2A]/6 bg-[#1F2A2A]/[0.02] opacity-60 cursor-not-allowed"
                    : "border-[#1F2A2A]/8 bg-[#F5F1EB]/60 hover:border-[#13695A]/30 hover:bg-[#13695A]/5"
                }`;
                const inner = (
                  <>
                    <Icon size={16} className="text-[#13695A] shrink-0" />
                    <span className="text-[#1F2A2A]/70 group-hover:text-[#1F2A2A] text-xs font-medium transition-colors leading-tight">
                      {t(label)}
                    </span>
                    {comingSoon && (
                      <span className="absolute top-1 right-1.5 text-[8px] font-bold text-[#1F2A2A]/35 bg-[#1F2A2A]/8 px-1 py-0.5 rounded">
                        {t("soon_label")}
                      </span>
                    )}
                  </>
                );

                return comingSoon || !href ? (
                  <button key={label} disabled className={baseCls}>{inner}</button>
                ) : (
                  <Link key={label} href={href} className={baseCls}>{inner}</Link>
                );
              })}
            </div>
          </div>

          <div className={cn(CARD, "p-5")}>
            <h3 className="text-[#1F2A2A] font-semibold text-sm tracking-tight mb-4">
              {t("ov_revenue")}
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { src: "/mtn%20logo%20momo.png", label: "MTN MoMo" },
                { src: "/orange-money-logo-png_seeklogo-440383.png", label: "Orange Money" },
              ].map(({ src, label }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-[#F5F1EB]/70 border border-[#1F2A2A]/8 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-white border border-[#1F2A2A]/8 rounded-lg flex items-center justify-center p-1 shrink-0">
                      <img src={src} alt={label} className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="text-[#1F2A2A] text-xs font-semibold">{label}</span>
                  </div>
                  <span className="text-[#1F2A2A]/40 text-sm font-bold">—</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-[#1F2A2A]/8">
                <span className="text-[#1F2A2A]/50 text-xs">{t("ov_total_confirmed")}</span>
                <span className="text-[#1F2A2A] font-bold text-base tracking-tight">
                  {fmt(stats.totalRevenueXaf)}
                </span>
              </div>
              <button
                disabled
                className="relative w-full bg-[#1F2A2A]/6 text-[#1F2A2A]/35 text-xs font-semibold py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <RiArrowRightUpLine size={14} /> {t("ov_withdraw_momo")}
                <span className="absolute top-1.5 right-2 text-[8px] font-bold text-[#1F2A2A]/35 bg-[#1F2A2A]/8 px-1 py-0.5 rounded">
                  {t("soon_label")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Booking row ───────────────────────────────────────────────────────────────

function BookingRow({ booking }: { booking: RecentBooking }) {
  const { t } = useLanguage();
  const initials = getInitials(booking.guestName);
  const color = getAvatarColor(booking.guestName);
  const dateDisplay = booking.checkIn ?? booking.bookingDate ?? "—";
  const timeDisplay = booking.bookingTime ?? "";

  return (
    <div className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <div style={{ backgroundColor: color }} className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-sm">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm text-[#1F2A2A] font-semibold truncate">{booking.guestName}</div>
          <div className="text-xs text-[#1F2A2A]/55 truncate">
            {booking.listingName} · {dateDisplay}{timeDisplay ? ` · ${timeDisplay}` : ""} · {booking.guests} {booking.guests !== 1 ? t("guest_plural") : t("guest_singular")}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <div className="text-sm text-[#1F2A2A] font-semibold whitespace-nowrap">{fmt(booking.totalXaf)}</div>
        <StatusBadge status={booking.status} />
      </div>
    </div>
  );
}

// ─── Mini calendar ─────────────────────────────────────────────────────────────

function MiniCalendar() {
  const { lang } = useLanguage();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDay = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = now.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", { month: "long", year: "numeric" });

  return (
    <div className={cn(CARD, "p-5")}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#1F2A2A] font-semibold text-sm tracking-tight capitalize">{monthName}</h3>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {(lang === "fr" ? ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]).map((d) => (
          <div key={d} className="text-[9.5px] font-bold text-[#1F2A2A]/30 py-1.5">{d}</div>
        ))}
        {[...Array(firstDayOfWeek)].map((_, i) => <div key={`e${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const isToday = day === todayDay;
          return (
            <div key={day} className={cn(
              "text-[11.5px] py-1.5 rounded-md cursor-pointer transition-all",
              isToday ? "bg-[#13695A] text-white font-bold" : "text-[#1F2A2A]/70 hover:bg-[#1F2A2A]/6 hover:text-[#1F2A2A]"
            )}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
