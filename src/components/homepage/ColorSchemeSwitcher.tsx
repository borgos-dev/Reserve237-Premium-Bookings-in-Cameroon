"use client";

import { motion } from "motion/react";
import { RiPaletteLine } from "react-icons/ri";
import { useState } from "react";
import { useColorScheme } from "@/components/theme-provider";

type ColorScheme = "neo-minimalist" | "cameroon-sunset" | "midnight-reserve" | "refined-warmth";

const schemes: Array<{ id: ColorScheme; name: string; description: string }> = [
  { id: "neo-minimalist", name: "Neo-Minimalist", description: "Champagne Gold" },
  { id: "cameroon-sunset", name: "Cameroon Sunset", description: "Forest Green + Copper" },
  { id: "midnight-reserve", name: "Midnight Reserve", description: "Navy + Teal" },
  { id: "refined-warmth", name: "Refined Warmth", description: "Espresso + Sienna" },
];

export function ColorSchemeSwitcher() {
  const { changeScheme, scheme } = useColorScheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-50 sm:top-24 sm:bottom-auto">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[var(--card)]/80 backdrop-blur-md border-2 border-[var(--primary)]/20 flex items-center justify-center hover:border-[var(--primary)]/50 transition-colors"
      >
        <RiPaletteLine className="w-6 h-6 text-[var(--primary)]" />
      </motion.button>

      {/* Dropdown Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0.95,
          y: isOpen ? 0 : -10,
        }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-16 right-0 glass rounded-2xl p-2 w-56 pointer-events-none sm:top-16 sm:bottom-auto"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        <div className="space-y-1">
          {schemes.map((colorScheme) => (
            <motion.button
              key={colorScheme.id}
              onClick={() => {
                changeScheme(colorScheme.id);
                setIsOpen(false);
              }}
              whileHover={{ x: 4 }}
              className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                scheme === colorScheme.id
                  ? "bg-[var(--primary)]/20 border border-[var(--primary)]/50"
                  : "hover:bg-[var(--secondary)]"
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{colorScheme.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{colorScheme.description}</p>
              </div>
              {scheme === colorScheme.id && (
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] ml-2 flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
