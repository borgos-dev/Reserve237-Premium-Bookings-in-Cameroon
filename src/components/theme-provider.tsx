"use client";

import { ReactNode, useEffect, useState } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

type ColorScheme = "neo-minimalist" | "cameroon-sunset" | "midnight-reserve" | "refined-warmth";

const colorSchemes: Record<ColorScheme, Record<string, string>> = {
  "neo-minimalist": {
    "--background": "#121212",
    "--foreground": "#F5F5F7",
    "--card": "#1a1a1a",
    "--primary": "#C19A6B",
    "--primary-foreground": "#121212",
    "--secondary": "#2a2a2a",
    "--muted": "#1a1a1a",
    "--muted-foreground": "#9CA3AF",
    "--border": "rgba(193, 154, 107, 0.15)",
    "--input": "rgba(193, 154, 107, 0.1)",
    "--input-background": "rgba(255, 255, 255, 0.05)",
    "--glass-bg": "rgba(26, 26, 26, 0.7)",
    "--glass-border": "rgba(193, 154, 107, 0.2)",
    "--chart-1": "#C19A6B",
    "--chart-2": "#D4AF77",
    "--chart-3": "#8B7355",
    "--chart-4": "#F5F5F7",
    "--chart-5": "#9CA3AF",
  },
  "cameroon-sunset": {
    "--background": "#0A3D2C",
    "--foreground": "#FFF8F0",
    "--card": "#164B38",
    "--primary": "#D97742",
    "--primary-foreground": "#FFF8F0",
    "--secondary": "#0F5540",
    "--muted": "#164B38",
    "--muted-foreground": "#D5C9B8",
    "--border": "rgba(217, 119, 66, 0.15)",
    "--input": "rgba(217, 119, 66, 0.1)",
    "--input-background": "rgba(255, 255, 255, 0.05)",
    "--glass-bg": "rgba(22, 75, 56, 0.7)",
    "--glass-border": "rgba(217, 119, 66, 0.2)",
    "--chart-1": "#D97742",
    "--chart-2": "#E89D63",
    "--chart-3": "#B85D34",
    "--chart-4": "#FFF8F0",
    "--chart-5": "#D5C9B8",
  },
  "midnight-reserve": {
    "--background": "#0F1B2E",
    "--foreground": "#FAFAFA",
    "--card": "#1a2d47",
    "--primary": "#00B8A9",
    "--primary-foreground": "#0F1B2E",
    "--secondary": "#1a2d47",
    "--muted": "#1a2d47",
    "--muted-foreground": "#9CA3AF",
    "--border": "rgba(0, 184, 169, 0.15)",
    "--input": "rgba(0, 184, 169, 0.1)",
    "--input-background": "rgba(255, 255, 255, 0.05)",
    "--glass-bg": "rgba(26, 45, 71, 0.7)",
    "--glass-border": "rgba(0, 184, 169, 0.2)",
    "--chart-1": "#00B8A9",
    "--chart-2": "#1FD4C7",
    "--chart-3": "#008B84",
    "--chart-4": "#FAFAFA",
    "--chart-5": "#9CA3AF",
  },
  "refined-warmth": {
    "--background": "#2C1810",
    "--foreground": "#FAF7F2",
    "--card": "#3D2416",
    "--primary": "#E86A33",
    "--primary-foreground": "#FAF7F2",
    "--secondary": "#4A3220",
    "--muted": "#3D2416",
    "--muted-foreground": "#D5C9B8",
    "--border": "rgba(232, 106, 51, 0.15)",
    "--input": "rgba(232, 106, 51, 0.1)",
    "--input-background": "rgba(255, 255, 255, 0.05)",
    "--glass-bg": "rgba(61, 36, 22, 0.7)",
    "--glass-border": "rgba(232, 106, 51, 0.2)",
    "--chart-1": "#E86A33",
    "--chart-2": "#F08A54",
    "--chart-3": "#C64C20",
    "--chart-4": "#FAF7F2",
    "--chart-5": "#D5C9B8",
  },
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

export function useColorScheme() {
  const [scheme, setScheme] = useState<ColorScheme>("neo-minimalist");

  const changeScheme = (newScheme: ColorScheme) => {
    const root = document.documentElement;
    const colors = colorSchemes[newScheme];
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    localStorage.setItem("reserve237-theme", newScheme);
    setScheme(newScheme);
  };

  return {
    scheme,
    changeScheme,
    availableSchemes: Object.keys(colorSchemes) as ColorScheme[],
  };
}
