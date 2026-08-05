"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  RiCommunityLine,
  RiShieldCheckLine,
  RiFlashlightLine,
  RiGiftLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { categoryColors, categoryIcons, ALL_MAIN_CATEGORIES } from "@/lib/categoryColors";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

// Imagery reused from the proven Unsplash set already rendered site-wide
const IMG_MISSION = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80";
const IMG_BUSINESS = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80";

const STATS: { value: TranslationKey; label: TranslationKey }[] = [
  { value: "about_stat_1_v", label: "about_stat_1_l" },
  { value: "about_stat_2_v", label: "about_stat_2_l" },
  { value: "about_stat_3_v", label: "about_stat_3_l" },
  { value: "about_stat_4_v", label: "about_stat_4_l" },
];

const VALUES: { icon: typeof RiCommunityLine; title: TranslationKey; body: TranslationKey }[] = [
  { icon: RiCommunityLine, title: "about_v1_title", body: "about_v1_body" },
  { icon: RiShieldCheckLine, title: "about_v2_title", body: "about_v2_body" },
  { icon: RiFlashlightLine, title: "about_v3_title", body: "about_v3_body" },
  { icon: RiGiftLine, title: "about_v4_title", body: "about_v4_body" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-20">

        {/* ── Hero: dark panel, logo, headline ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#13695A] via-[#0F5F50] to-[#0A5C4A] px-6 py-16 sm:px-12 sm:py-20 text-center"
        >
          {/* Soft glow orbs, same language as the homepage hero */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#E8B923] rounded-full blur-[140px] opacity-15 pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#F8F1EA] rounded-full blur-[140px] opacity-10 pointer-events-none" />

          <div className="relative z-10">
            {/* Tight-cropped logo (the original PNG is 70% transparent padding)
                shown large with a soft gold halo */}
            <Image
              src="/Reserve237-logo-tight.png"
              alt="Reserve237"
              width={274}
              height={148}
              unoptimized
              priority
              className="h-28 sm:h-36 md:h-44 w-auto mx-auto mb-8 drop-shadow-[0_0_45px_rgba(232,185,35,0.45)]"
            />
            <h1 className="text-3xl sm:text-5xl font-bold text-[#F8F1EA] max-w-3xl mx-auto leading-tight mb-5">
              {t("about_hero_title")}
            </h1>
            <p className="text-[#F8F1EA]/80 text-base sm:text-lg max-w-2xl mx-auto mb-9">
              {t("about_intro")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#browse"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#E8B923] hover:bg-[#D9AC1B] text-[#1F2A2A] font-semibold text-sm transition-colors"
              >
                {t("browse_listings_btn")}
                <RiArrowRightLine className="w-4 h-4" />
              </Link>
              <Link
                href="/business"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#F8F1EA]/40 hover:border-[#F8F1EA] text-[#F8F1EA] font-semibold text-sm transition-colors"
              >
                {t("footer_list_business")}
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ── Stats band ── */}
        <motion.section {...fadeUp}>
          <div className="card p-0 overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--border)]">
              {STATS.map(({ value, label }) => (
                <div key={value} className="px-6 py-8 text-center">
                  <p className="font-display text-3xl sm:text-4xl font-bold text-[var(--primary)]">
                    {t(value)}
                  </p>
                  <p className="text-[var(--muted-foreground)] text-xs sm:text-sm mt-2 leading-snug">
                    {t(label)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Mission: image + story ── */}
        <motion.section {...fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
              <Image
                src={IMG_MISSION}
                alt={t("about_s1_title")}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                unoptimized
                className="object-cover"
              />
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-5 -right-2 sm:right-6 card px-5 py-4 shadow-xl flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#E8B923]/20 flex items-center justify-center">
                <RiShieldCheckLine className="w-5 h-5 text-[var(--primary)]" />
              </span>
              <p className="text-sm font-semibold">{t("verified_partner")}</p>
            </div>
          </div>
          <div>
            <p className="text-[var(--primary)] text-sm font-semibold uppercase tracking-widest mb-3">
              {t("about_title")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">{t("about_s1_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed text-base sm:text-lg">
              {t("about_s1_body")}
            </p>
          </div>
        </motion.section>

        {/* ── What we do: clickable category mosaic ── */}
        <motion.section {...fadeUp}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("about_s2_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("about_s2_body")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ALL_MAIN_CATEGORIES.map((cat) => {
              const colors = categoryColors[cat];
              const Icon = categoryIcons[cat];
              return (
                <Link
                  key={cat}
                  href={`/?category=${cat}#browse`}
                  className="group flex min-h-28 flex-col items-start justify-between rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--primary)] hover:-translate-y-1"
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${colors.activeBg}`}>
                    {Icon && <Icon className={`h-5 w-5 ${colors.text}`} />}
                  </span>
                  <span className="text-sm font-semibold leading-tight">
                    {t(`cat_${cat.replace(/-/g, "_")}` as Parameters<typeof t>[0])}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
            {t("about_explore_categories")} →{" "}
            <Link href="/#browse" className="text-[var(--primary)] font-medium hover:underline">
              {t("browse_listings_btn")}
            </Link>
          </p>
        </motion.section>

        {/* ── Values ── */}
        <motion.section {...fadeUp}>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">{t("about_values_title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 mb-5">
                  <Icon className="h-6 w-6 text-[var(--primary)]" />
                </span>
                <h3 className="text-lg font-semibold mb-2">{t(title)}</h3>
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">{t(body)}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── For businesses: image + pitch ── */}
        <motion.section {...fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="md:order-2 relative aspect-[4/3] rounded-[2rem] overflow-hidden">
            <Image
              src={IMG_BUSINESS}
              alt={t("about_s3_title")}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="md:order-1">
            <p className="text-[var(--primary)] text-sm font-semibold uppercase tracking-widest mb-3">
              {t("footer_partners")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">{t("about_s3_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed text-base sm:text-lg mb-7">
              {t("about_s3_body")}
            </p>
            <Link href="/business" className="btn-primary inline-flex items-center gap-2">
              {t("footer_list_business")}
              <RiArrowRightLine className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>

        {/* ── Final CTA ── */}
        <motion.section {...fadeUp}>
          <div className="card text-center px-6 py-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t("about_cta_pre")}</h2>
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              {t("about_cta_link")}
              <RiArrowRightLine className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>
      </div>

      <NewFooter />
    </main>
  );
}
