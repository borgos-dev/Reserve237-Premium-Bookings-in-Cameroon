"use client";

import { motion } from "motion/react";
import { RiHome4Line, RiSearchLine, RiCalendarLine, RiUserLine } from "react-icons/ri";
import { useState } from "react";

const navItems = [
  { icon: RiHome4Line, label: "Home", id: "home" },
  { icon: RiSearchLine, label: "Search", id: "search" },
  { icon: RiCalendarLine, label: "Bookings", id: "bookings" },
  { icon: RiUserLine, label: "Profile", id: "profile" },
];

export function MobileBottomNav() {
  const [activeItem, setActiveItem] = useState("home");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--card)] border-t border-[var(--border)]">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs font-medium"
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMobileNav"
                  className="absolute inset-0 bg-[var(--primary)]/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  style={{ zIndex: -1 }}
                />
              )}

              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              />
              <span
                className={`${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
