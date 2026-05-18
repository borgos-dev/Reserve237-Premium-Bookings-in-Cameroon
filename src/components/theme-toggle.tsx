"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", light);
  }, [light]);

  return (
    <button
      type="button"
      onClick={() => setLight((current) => !current)}
      className="rounded-2xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]"
      aria-pressed={light}
    >
      {light ? "Dark" : "Light"} mode
    </button>
  );
}
