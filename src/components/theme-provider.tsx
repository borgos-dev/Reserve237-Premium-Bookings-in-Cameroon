"use client";

import { ReactNode, useEffect, useState } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

type ColorScheme = "neo-minimalist" | "cameroon-sunset" | "midnight-reserve" | "refined-warmth";

const reservePalette: Record<string, string> = {
  "--surface-1": "#F8F1EA",
  "--surface-2": "#F2EADF",
  "--surface-3": "#EDE4D9",
  "--text-primary": "#1F2A2A",
  "--text-secondary": "#5A6868",
  "--text-tertiary": "#8A8580",
  "--text-inverse": "#F8F1EA",
  "--primary": "#13695A",
  "--primary-hover": "#0A5C4A",
  "--primary-foreground": "#F8F1EA",
  "--accent": "#E8B923",
  "--destructive": "#B8442E",
  "--destructive-foreground": "#F8F1EA",
  "--background": "#F8F1EA",
  "--foreground": "#1F2A2A",
  "--card": "#EDE4D9",
  "--cta-hover": "#0A5C4A",
  "--secondary": "#F2EADF",
  "--muted": "#F2EADF",
  "--muted-foreground": "#5A6868",
  "--border": "rgba(19, 105, 90, 0.18)",
  "--input": "rgba(19, 105, 90, 0.1)",
  "--input-background": "rgba(31, 42, 42, 0.04)",
  "--glass-bg": "rgba(248, 241, 234, 0.82)",
  "--glass-border": "rgba(19, 105, 90, 0.22)",
  "--chart-1": "#13695A",
  "--chart-2": "#E8B923",
  "--chart-3": "#0A5C4A",
  "--chart-4": "#1F2A2A",
  "--chart-5": "#8A8580",
};

const colorSchemes: Record<ColorScheme, Record<string, string>> = {
  "neo-minimalist": reservePalette,
  "cameroon-sunset": reservePalette,
  "midnight-reserve": reservePalette,
  "refined-warmth": reservePalette,
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("reserve237-theme") as ColorScheme | null;
    if (savedTheme && colorSchemes[savedTheme]) {
      applyColorScheme(savedTheme);
    } else {
      applyColorScheme("neo-minimalist");
    }
  }, []);

  const applyColorScheme = (scheme: ColorScheme) => {
    const root = document.documentElement;
    const colors = colorSchemes[scheme];
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    localStorage.setItem("reserve237-theme", scheme);
  };

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
