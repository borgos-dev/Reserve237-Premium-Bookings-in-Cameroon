"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import {
  RiShieldCheckLine,
  RiFlashlightLine,
  RiLineChartLine,
  RiTeamLine,
  RiCalendarCheckLine,
  RiArrowRightLine,
  RiAddCircleLine,
  RiSearchLine,
  RiHandCoinLine,
  RiCheckLine,
  RiStarLine,
} from "react-icons/ri";

// ─── Features ─────────────────────────────────────────────────────────────────

const features: { icon: React.ElementType; title: TranslationKey; description: TranslationKey }[] = [
  { icon: RiShieldCheckLine, title: "biz_feature1_title", description: "biz_feature1_desc" },
  { icon: RiFlashlightLine, title: "biz_feature2_title", description: "biz_feature2_desc" },
  { icon: RiLineChartLine, title: "biz_feature3_title", description: "biz_feature3_desc" },
  { icon: RiTeamLine, title: "biz_feature4_title", description: "biz_feature4_desc" },
  { icon: RiCalendarCheckLine, title: "biz_feature5_title", description: "biz_feature5_desc" },
  { icon: RiHandCoinLine, title: "biz_feature6_title", description: "biz_feature6_desc" },
];

// ─── How it works steps ───────────────────────────────────────────────────────

const steps: { number: string; icon: React.ElementType; title: TranslationKey; description: TranslationKey }[] = [
  { number: "01", icon: RiAddCircleLine, title: "biz_step1_title", description: "biz_step1_desc" },
  { number: "02", icon: RiSearchLine, title: "biz_step2_title", description: "biz_step2_desc" },
  { number: "03", icon: RiHandCoinLine, title: "biz_step3_title", description: "biz_step3_desc" },
];

// ─── Pricing points ───────────────────────────────────────────────────────────

const pricingPoints: TranslationKey[] = [
  "biz_point1",
  "biz_point2",
  "biz_point3",
  "biz_point4",
  "biz_point5",
  "biz_point6",
];

// ─── Page content ─────────────────────────────────────────────────────────────

export function BusinessLanding() {
  const { t } = useLanguage();

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />

      {/* ── Hero ── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--surface-1)]" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--primary)] rounded-full blur-[128px] opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--primary)] rounded-full blur-[128px] opacity-10 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {t("biz_hero_title1")}
            <br />
            <span className="text-[var(--primary)]">{t("biz_hero_title2")}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-6">
            {t("biz_hero_subtitle")}
          </p>

          {/* Pricing pill */}
          <p className="text-sm text-[var(--muted-foreground)] mb-8">
            <span className="font-semibold text-[var(--foreground)]">{t("biz_free_to_list")}</span>
            {" "}{t("biz_pricing_pill")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/business/sign-up"
              className="btn-primary px-8 py-4 text-base flex items-center justify-center gap-2"
            >
              {t("biz_cta_list")}
              <RiArrowRightLine className="w-4 h-4" />
            </Link>
            <Link
              href="/business/sign-in"
              className="btn-secondary px-8 py-4 text-base"
            >
              {t("biz_cta_signin")}
            </Link>
          </div>

          {/* Payment logos */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs text-[var(--muted-foreground)]">{t("payments_via")}</span>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm border border-[var(--border)]">
                <Image
                  src="/mtn%20logo%20momo.png"
                  alt="MTN MoMo"
                  width={64}
                  height={24}
                  className="h-6 w-auto object-contain"
                  unoptimized
                />
              </div>
              <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm border border-[var(--border)]">
                <Image
                  src="/orange-money-logo-png_seeklogo-440383.png"
                  alt="Orange Money"
                  width={64}
                  height={24}
                  className="h-6 w-auto object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("biz_how_title")}</h2>
            <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
              {t("biz_how_subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-[var(--border)]" />

            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative text-center">
                  {/* Number + icon */}
                  <div className="flex flex-col items-center mb-5">
                    <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mb-3 shadow-lg relative z-10">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[var(--primary)] text-xs font-bold tracking-widest uppercase">
                      {t("biz_step")} {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3">{t(step.title)}</h3>
                  <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                    {t(step.description)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 bg-[var(--surface-1)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                <RiStarLine className="w-3.5 h-3.5" />
                {t("biz_honest_pricing")}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("biz_free_to_list")}
                <br />
                <span className="text-[var(--primary)]">{t("biz_pricing_title2")}</span>
              </h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {t("biz_pricing_desc")}
              </p>
            </div>

            {/* Right: checklist */}
            <div className="card space-y-3">
              {pricingPoints.map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--primary)]/15 flex items-center justify-center shrink-0">
                    <RiCheckLine className="w-3 h-3 text-[var(--primary)]" />
                  </div>
                  <span className="text-sm text-[var(--foreground)]">{t(point)}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-[var(--border)] mt-4 flex items-center gap-3">
                <span className="text-xs text-[var(--muted-foreground)]">{t("biz_payouts_via")}</span>
                <Image
                  src="/mtn%20logo%20momo.png"
                  alt="MTN MoMo"
                  width={48}
                  height={20}
                  className="h-5 w-auto object-contain"
                  unoptimized
                />
                <Image
                  src="/orange-money-logo-png_seeklogo-440383.png"
                  alt="Orange Money"
                  width={48}
                  height={20}
                  className="h-5 w-auto object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("biz_features_title")}
            </h2>
            <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
              {t("biz_features_subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card hover:border-[var(--primary)]/30 transition-colors">
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(f.title)}</h3>
                  <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                    {t(f.description)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-[var(--primary)]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("biz_final_title")}
          </h2>
          <p className="text-white/70 mb-3 text-lg">
            {t("biz_final_subtitle")}
          </p>
          <p className="text-white/60 text-sm mb-10">
            {t("biz_final_note")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/business/sign-up"
              className="bg-white text-[var(--primary)] hover:bg-[var(--surface-1)] px-10 py-4 rounded-full font-semibold text-base inline-flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              {t("biz_final_cta")}
              <RiArrowRightLine className="w-5 h-5" />
            </Link>
            <Link
              href="/business/sign-in"
              className="border-2 border-white/40 text-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold text-base inline-flex items-center justify-center transition-colors"
            >
              {t("biz_final_signin")}
            </Link>
          </div>
        </div>
      </section>

      <NewFooter />
    </main>
  );
}
