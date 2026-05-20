"use client";

import { motion } from "motion/react";
import { CategorySwitcher } from "./CategorySwitcher";
import { AdaptiveSearch } from "./AdaptiveSearch";

export function NewHero() {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24">
      {/* Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--surface-1)]" />

      {/* Pulsing Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--primary)] rounded-full blur-[128px] opacity-10 animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--primary)] rounded-full blur-[128px] opacity-10 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
            Experience the Best
            <br />
            <span className="text-[var(--primary)]">of Your City</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
            From vibrant nightlife to peaceful stays — curated experiences across Cameroon
          </p>
        </motion.div>

        {/* Category Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <CategorySwitcher />
        </motion.div>

        {/* Adaptive Search — no Search button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <AdaptiveSearch />
        </motion.div>
      </div>
    </div>
  );
}
