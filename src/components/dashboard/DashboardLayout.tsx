"use client";

import { motion } from "motion/react";
import {
  RiDashboardLine,
  RiCalendarLine,
  RiTimeLine,
  RiStoreLine,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { icon: RiDashboardLine, label: "Overview", href: "/dashboard" },
  { icon: RiCalendarLine, label: "Reservations", href: "/dashboard/reservations" },
  { icon: RiTimeLine, label: "Availability", href: "/dashboard/availability" },
  { icon: RiStoreLine, label: "Listings", href: "/dashboard/listings" },
  { icon: RiSettings4Line, label: "Settings", href: "/dashboard/settings" },
];

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ open = true, onClose }: DashboardSidebarProps) {
  return (
    <motion.div
      initial={{ x: -256 }}
      animate={{ x: open ? 0 : -256 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 w-64 h-screen bg-[var(--card)] border-r border-[var(--border)] p-6 z-40 md:static md:translate-x-0 md:z-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center flex-shrink-0">
          <img src="/Reserve237-logo.png" alt="Reserve237" className="h-16 w-auto max-w-[160px] object-contain" />
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1 hover:bg-[var(--secondary)] rounded-lg transition-colors"
        >
          <RiCloseLine className="w-6 h-6" />
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-all group"
            >
              <Icon className="w-5 h-5 group-hover:text-[var(--primary)]" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-[var(--border)] pt-4">
        <button className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-all text-sm">
          <div className="w-4 h-4 bg-[var(--primary)]/50 rounded-full" />
          Pause Bookings
        </button>
        <button className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
          <RiLogoutBoxRLine className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.div>
  );
}

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <div className="bg-[var(--card)] border-b border-[var(--border)] h-20 flex items-center justify-between px-6">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
      >
        <RiMenuLine className="w-6 h-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-[var(--primary-foreground)] font-bold text-sm">
          JD
        </div>
        <div className="hidden sm:block">
          <p className="font-semibold text-sm">John Doe</p>
          <p className="text-xs text-[var(--muted-foreground)]">Partner</p>
        </div>
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayoutWrapper({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-auto">
          <main className="max-w-7xl mx-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
