"use client";

import Link from "next/link";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

const sections: { title: TranslationKey; body: TranslationKey }[] = [
  { title: "about_s1_title", body: "about_s1_body" },
  { title: "about_s2_title", body: "about_s2_body" },
  { title: "about_s3_title", body: "about_s3_body" },
];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <NewNavbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-32">
        <h1 className="text-4xl font-bold mb-6">{t("about_title")}</h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed text-lg mb-10">
          {t("about_intro")}
        </p>

        <div className="space-y-8">
          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-xl font-semibold mb-3">{t(title)}</h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed">{t(body)}</p>
            </section>
          ))}

          <section>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {t("about_cta_pre")}{" "}
              <Link href="/contact" className="text-[var(--primary)] hover:underline">
                {t("about_cta_link")}
              </Link>
            </p>
          </section>
        </div>
      </div>
      <NewFooter />
    </main>
  );
}
