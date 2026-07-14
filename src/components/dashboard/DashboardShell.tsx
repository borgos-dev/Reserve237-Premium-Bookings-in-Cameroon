"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import {
  RiDashboardLine,
  RiCalendarEventLine,
  RiBuilding2Line,
  RiTimeLine,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiCloseLine,
  RiNotification3Line,
} from "react-icons/ri";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import type { PendingBookingsResult } from "@/actions/dashboard";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV: { Icon: React.ElementType; label: TranslationKey; href: string }[] = [
  { Icon: RiDashboardLine,     label: "dash_overview",      href: "/dashboard" },
  { Icon: RiCalendarEventLine, label: "dash_bookings",      href: "/dashboard/reservations" },
  { Icon: RiBuilding2Line,     label: "dash_my_listings",   href: "/dashboard/listings" },
  { Icon: RiTimeLine,          label: "dash_availability",  href: "/dashboard/availability" },
  { Icon: RiSettings4Line,     label: "dash_settings",      href: "/dashboard/settings" },
];

const PAGE_TITLES: Record<string, TranslationKey> = {
  "/dashboard/reservations": "dash_bookings",
  "/dashboard/listings":     "dash_my_listings",
  "/dashboard/availability": "dash_availability",
  "/dashboard/settings":     "dash_settings",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardShellProps {
  children: React.ReactNode;
  firstName: string;
  userId: string;
  pendingBookings: PendingBookingsResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardShell({ children, firstName, pendingBookings }: DashboardShellProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { t, lang } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isOverview = pathname === "/dashboard";
  const pageTitle = PAGE_TITLES[pathname] ? t(PAGE_TITLES[pathname]) : t("nav_dashboard");

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? t("dash_greet_morning")
      : today.getHours() < 18
      ? t("dash_greet_afternoon")
      : t("dash_greet_evening");
  const dateStr = today.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <div
      className="flex bg-[#F5F1EB] overflow-hidden relative"
      style={{ height: "100vh", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-[#1F2A2A]/60 z-20"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "w-[250px] shrink-0 flex flex-col bg-[#1F2A2A]",
          "fixed md:static top-0 bottom-0 left-0 z-30 md:z-auto transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand strip */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/8 shrink-0">
          <Link href="/">
            <img
              src="/Reserve237-logo.png"
              alt="Reserve237"
              className="h-11 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/50 hover:text-white/90"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto">
          <p className="text-[10px] font-semibold tracking-[1.6px] uppercase text-white/25 px-3 mb-2 mt-1">
            {t("dash_main")}
          </p>
          {NAV.map(({ Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-[#13695A] text-white shadow-sm"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{t(label)}</span>
              {label === "dash_bookings" && pendingBookings.count > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#E8B923] text-[#1F2A2A] text-[10px] font-bold flex items-center justify-center shrink-0">
                  {pendingBookings.count > 9 ? "9+" : pendingBookings.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/8 shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-9 h-9 rounded-full bg-[#13695A] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(firstName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{firstName}</p>
              <p className="text-[#E8B923] text-[10px] font-medium">{t("dash_partner")}</p>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              title={t("dash_sign_out")}
              className="text-white/30 hover:text-white/80 transition-colors"
            >
              <RiLogoutBoxRLine size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#1F2A2A]/8 flex items-center justify-between px-4 sm:px-6 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-[#1F2A2A]/5 text-[#1F2A2A]/70 shrink-0"
            >
              <RiMenuLine size={20} />
            </button>

            <div className="min-w-0">
              {isOverview ? (
                <>
                  <h1 className="text-[#1F2A2A] text-base sm:text-lg font-semibold tracking-tight truncate">
                    {greeting}, {firstName}
                  </h1>
                  <p className="text-[#1F2A2A]/45 text-[11px] mt-0.5 truncate hidden sm:block">
                    {dateStr}
                  </p>
                </>
              ) : (
                <h1 className="text-[#1F2A2A] text-base sm:text-lg font-semibold tracking-tight truncate">
                  {pageTitle}
                </h1>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative w-9 h-9 bg-white border border-[#1F2A2A]/12 rounded-lg flex items-center justify-center hover:bg-[#1F2A2A]/4 transition-colors"
              >
                <RiNotification3Line size={16} className="text-[#1F2A2A]/65" />
                {pendingBookings.count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E8B923] text-[#1F2A2A] text-[9px] font-bold flex items-center justify-center">
                    {pendingBookings.count > 9 ? "9+" : pendingBookings.count}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white border border-[#1F2A2A]/10 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#1F2A2A]/8">
                      <h3 className="text-sm font-semibold text-[#1F2A2A]">{t("dash_pending_title")}</h3>
                    </div>
                    {pendingBookings.items.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-[#1F2A2A]/40">
                        {t("dash_pending_empty")}
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto divide-y divide-[#1F2A2A]/8">
                        {pendingBookings.items.map((b) => (
                          <Link
                            key={b.id}
                            href="/dashboard/reservations"
                            onClick={() => setNotifOpen(false)}
                            className="block px-4 py-3 hover:bg-[#1F2A2A]/4 transition-colors"
                          >
                            <div className="text-sm font-semibold text-[#1F2A2A] truncate">{b.guestName}</div>
                            <div className="text-xs text-[#1F2A2A]/55 truncate">
                              {b.listingName} · {b.checkIn ?? b.bookingDate ?? "—"}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <Link
                      href="/dashboard/reservations"
                      onClick={() => setNotifOpen(false)}
                      className="block px-4 py-3 text-center text-xs font-semibold text-[#13695A] hover:text-[#0A5C4A] border-t border-[#1F2A2A]/8 transition-colors"
                    >
                      {t("ov_view_all")}
                    </Link>
                  </div>
                </>
              )}
            </div>
            <Link
              href="/dashboard/listings?new=1"
              className="bg-[#13695A] hover:bg-[#0A5C4A] text-white text-xs font-semibold px-3 sm:px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              {t("dash_new_listing")}
            </Link>
          </div>
        </header>

        {/* Page content — override surface vars so var()-based components render white cards */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#F5F1EB]"
          style={{
            "--card": "#ffffff",
            "--border": "rgba(31, 42, 42, 0.08)",
            "--surface-1": "#F5F1EB",
            "--secondary": "#F0EAE1",
          } as React.CSSProperties}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
