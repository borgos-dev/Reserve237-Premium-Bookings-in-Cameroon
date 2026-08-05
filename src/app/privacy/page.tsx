"use client";

import Link from "next/link";
import Image from "next/image";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

function Bullet({ bold, text }: { bold?: TranslationKey; text: TranslationKey }) {
  const { t } = useLanguage();
  return (
    <li className="flex items-start gap-2">
      <span className="text-[var(--primary)] mt-0.5">•</span>
      <span>
        {bold && <strong className="text-[var(--foreground)]">{t(bold)} </strong>}
        {t(text)}
      </span>
    </li>
  );
}

function SectionCard({ number, title, children }: { number: string; title: TranslationKey; children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <section className="card p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold">
          {number}
        </span>
        <h2 className="text-xl font-semibold">{t(title)}</h2>
      </div>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
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
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F8F1EA] mb-2">{t("pp_title")}</h1>
            <p className="text-[#F8F1EA]/70 text-sm">{t("pp_updated")}</p>
          </div>
        </div>

        <div className="space-y-5 text-[var(--foreground)]">

          <SectionCard number="01" title="pp_s1_title">
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s1_intro")}</p>
            <ul className="mt-3 space-y-2 text-[var(--muted-foreground)] text-sm">
              <Bullet bold="pp_s1_li1_b" text="pp_s1_li1" />
              <Bullet bold="pp_s1_li2_b" text="pp_s1_li2" />
              <Bullet bold="pp_s1_li3_b" text="pp_s1_li3" />
              <Bullet bold="pp_s1_li4_b" text="pp_s1_li4" />
            </ul>
          </SectionCard>

          <SectionCard number="02" title="pp_s2_title">
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s2_intro")}</p>
            <ul className="mt-3 space-y-2 text-[var(--muted-foreground)] text-sm">
              <Bullet text="pp_s2_li1" />
              <Bullet text="pp_s2_li2" />
              <Bullet text="pp_s2_li3" />
              <Bullet text="pp_s2_li4" />
              <Bullet text="pp_s2_li5" />
            </ul>
            <p className="text-[var(--muted-foreground)] leading-relaxed mt-3">{t("pp_s2_note")}</p>
          </SectionCard>

          <SectionCard number="03" title="pp_s3_title">
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s3_body")}</p>
          </SectionCard>

          <SectionCard number="04" title="pp_s4_title">
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s4_intro")}</p>
            <ul className="mt-3 space-y-2 text-[var(--muted-foreground)] text-sm">
              <Bullet bold="pp_s4_li1_b" text="pp_s4_li1" />
              <Bullet bold="pp_s4_li2_b" text="pp_s4_li2" />
              <Bullet bold="pp_s4_li3_b" text="pp_s4_li3" />
            </ul>
            <p className="text-[var(--muted-foreground)] leading-relaxed mt-3">{t("pp_s4_note")}</p>
          </SectionCard>

          <SectionCard number="05" title="pp_s5_title">
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s5_intro")}</p>
            <ul className="mt-3 space-y-2 text-[var(--muted-foreground)] text-sm">
              <Bullet text="pp_s5_li1" />
              <Bullet text="pp_s5_li2" />
              <Bullet text="pp_s5_li3" />
              <Bullet text="pp_s5_li4" />
            </ul>
            <p className="text-[var(--muted-foreground)] leading-relaxed mt-3">{t("pp_s5_note")}</p>
          </SectionCard>

          <SectionCard number="06" title="pp_s6_title">
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s6_body")}</p>
          </SectionCard>

          <SectionCard number="07" title="pp_s7_title">
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {t("pp_s7_body")}{" "}
              <Link href="/contact" className="text-[var(--primary)] hover:underline">
                {t("pp_contact_link")}
              </Link>.
            </p>
          </SectionCard>
        </div>
      </div>
      <NewFooter />
    </main>
  );
}
