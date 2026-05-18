"use client";

import { motion } from "motion/react";

export default function AvailabilityPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold mb-2">Availability</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Manage your availability calendar
      </p>

      <div className="card p-12 text-center">
        <p className="text-[var(--muted-foreground)]">
          Availability calendar coming soon
        </p>
      </div>
    </motion.div>
  );
}
