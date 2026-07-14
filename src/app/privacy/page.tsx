"use client";

import Link from "next/link";
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

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-32">
        <h1 className="text-4xl font-bold mb-2">{t("pp_title")}</h1>
        <p className="text-[var(--muted-foreground)] text-sm mb-10">{t("pp_updated")}</p>

        <div className="space-y-8 text-[var(--foreground)]">

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("pp_s1_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s1_intro")}</p>
            <ul className="mt-3 space-y-2 text-[var(--muted-foreground)] text-sm">
              <Bullet bold="pp_s1_li1_b" text="pp_s1_li1" />
              <Bullet bold="pp_s1_li2_b" text="pp_s1_li2" />
              <Bullet bold="pp_s1_li3_b" text="pp_s1_li3" />
              <Bullet bold="pp_s1_li4_b" text="pp_s1_li4" />
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("pp_s2_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s2_intro")}</p>
            <ul className="mt-3 space-y-2 text-[var(--muted-foreground)] text-sm">
              <Bullet text="pp_s2_li1" />
              <Bullet text="pp_s2_li2" />
              <Bullet text="pp_s2_li3" />
              <Bullet text="pp_s2_li4" />
              <Bullet text="pp_s2_li5" />
            </ul>
            <p className="text-[var(--muted-foreground)] leading-relaxed mt-3">{t("pp_s2_note")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("pp_s3_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s3_body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("pp_s4_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s4_intro")}</p>
            <ul className="mt-3 space-y-2 text-[var(--muted-foreground)] text-sm">
              <Bullet bold="pp_s4_li1_b" text="pp_s4_li1" />
              <Bullet bold="pp_s4_li2_b" text="pp_s4_li2" />
              <Bullet bold="pp_s4_li3_b" text="pp_s4_li3" />
            </ul>
            <p className="text-[var(--muted-foreground)] leading-relaxed mt-3">{t("pp_s4_note")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("pp_s5_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s5_intro")}</p>
            <ul className="mt-3 space-y-2 text-[var(--muted-foreground)] text-sm">
              <Bullet text="pp_s5_li1" />
              <Bullet text="pp_s5_li2" />
              <Bullet text="pp_s5_li3" />
              <Bullet text="pp_s5_li4" />
            </ul>
            <p className="text-[var(--muted-foreground)] leading-relaxed mt-3">{t("pp_s5_note")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("pp_s6_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{t("pp_s6_body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("pp_s7_title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {t("pp_s7_body")}{" "}
              <Link href="/contact" className="text-[var(--primary)] hover:underline">
                {t("pp_contact_link")}
              </Link>.
            </p>
          </section>
        </div>
      </div>
      <NewFooter />
    </main>
  );
}
