"use client";

import Link from "next/link";
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-32">
        <h1 className="text-4xl font-bold mb-2">{t("tos_title")}</h1>
        <p className="text-[var(--muted-foreground)] text-sm mb-10">{t("tos_updated")}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-[var(--foreground)]">
          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-xl font-semibold mb-3">{t(title)}</h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed">{t(body)}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold mb-3">{t("tos_s9_title")}</h2>
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
