"use client";

import Link from "next/link";
import Image from "next/image";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

const sections: { title: TranslationKey; body: TranslationKey }[] = [
  { title: "tos_s1_title", body: "tos_s1_body" },
  { title: "tos_s2_title", body: "tos_s2_body" },
  { title: "tos_s3_title", body: "tos_s3_body" },
  { title: "tos_s4_title", body: "tos_s4_body" },
  { title: "tos_s5_title", body: "tos_s5_body" },
  { title: "tos_s6_title", body: "tos_s6_body" },
  { title: "tos_s7_title", body: "tos_s7_body" },
  { title: "tos_s8_title", body: "tos_s8_body" },
];

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-24">

        {/* Branded header — dark panel so the light logo artwork shows */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#13695A] via-[#0F5F50] to-[#0A5C4A] px-6 py-12 text-center mb-10">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#E8B923] rounded-full blur-[120px] opacity-15 pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#F8F1EA] rounded-full blur-[120px] opacity-10 pointer-events-none" />
          <div className="relative z-10">
            <Image
              src="/Reserve237-logo-tight.png"
              alt="Reserve237"
              width={274}
              height={148}
              unoptimized
              className="h-16 sm:h-20 w-auto mx-auto mb-5 drop-shadow-[0_0_30px_rgba(232,185,35,0.4)]"
            />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8F1EA] mb-2">{t("tos_title")}</h1>
            <p className="text-[#F8F1EA]/70 text-sm">{t("tos_updated")}</p>
          </div>
        </div>

        <div className="space-y-5 text-[var(--foreground)]">
          {sections.map(({ title, body }, i) => (
            <section key={title} className="card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-xl font-semibold">{t(title)}</h2>
              </div>
              <p className="text-[var(--muted-foreground)] leading-relaxed">{t(body)}</p>
            </section>
          ))}

          <section className="card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold">
                09
              </span>
              <h2 className="text-xl font-semibold">{t("tos_s9_title")}</h2>
            </div>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {t("tos_s9_pre")}{" "}
              <Link href="/contact" className="text-[var(--primary)] hover:underline">
                {t("tos_s9_link")}
              </Link>{" "}
              {t("tos_s9_post")}
            </p>
          </section>
        </div>
      </div>
      <NewFooter />
    </main>
  );
}
