"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function AuthHeader() {
  const { t } = useLanguage();

  return (
    <header className="relative mx-auto flex min-h-32 w-full max-w-7xl flex-col items-center justify-center gap-1 px-4 py-3 sm:h-28 sm:min-h-0 sm:flex-row sm:px-6 sm:py-0 lg:px-8">
      <Link href="/" className="flex items-center sm:absolute sm:left-6 lg:left-8">
        <img
          src="/Reserve237-logo.png"
          alt="Reserve237"
          className="h-14 w-auto max-w-[120px] object-contain drop-shadow-[0_2px_8px_rgba(31,42,42,0.3)] sm:h-20 sm:max-w-[170px] md:h-24 md:max-w-[200px]"
          draggable={false}
        />
      </Link>

      <nav className="flex items-center justify-center gap-6 sm:gap-8">
        <Link
          href="/"
          className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          {t("nav_home")}
        </Link>
        <Link
          href="/business"
          className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          {t("nav_for_business")}
        </Link>
      </nav>
    </header>
  );
}
