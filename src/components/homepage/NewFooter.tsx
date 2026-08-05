"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { LogoWordmark } from "@/components/LogoWordmark";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

// Every link points somewhere real — category links deep-link into the browse
// section via query params (read by SearchFilterSection on mount).
const footerLinks: { title: TranslationKey; links: { label: TranslationKey; href: string }[] }[] = [
  {
    title: "footer_explore",
    links: [
      { label: "footer_restaurants", href: "/?category=food-drinks#browse" },
      { label: "footer_nightlife", href: "/?category=nightlife#browse" },
      { label: "footer_guest_houses", href: "/?category=accommodation#browse" },
      { label: "footer_event_spaces", href: "/?category=events-venues#browse" },
      { label: "cat_beauty_wellness", href: "/?category=beauty-wellness#browse" },
    ],
  },
  {
    title: "footer_partners",
    links: [
      { label: "footer_list_business", href: "/business" },
      { label: "footer_pricing", href: "/business" },
      { label: "footer_dashboard", href: "/dashboard" },
      { label: "footer_partner_signin", href: "/business/sign-in" },
    ],
  },
  {
    title: "footer_company",
    links: [
      { label: "footer_about", href: "/about" },
      { label: "nav_contact", href: "/contact" },
      { label: "privacy_policy", href: "/privacy" },
      { label: "terms_of_service", href: "/terms" },
    ],
  },
];

export function NewFooter() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[var(--surface-2)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-4">
              <LogoWordmark size="text-2xl sm:text-3xl" />
            </div>
            <p className="text-[var(--muted-foreground)] text-sm mb-6">
              {t("footer_tagline")}
            </p>
          </motion.div>

          {/* Footer Columns */}
          {footerLinks.map(({ title, links }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index + 1) * 0.1, duration: 0.6 }}
            >
              <h4 className="font-semibold mb-4">{t(title)}</h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors text-sm">
                      {t(label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[var(--muted-foreground)] text-sm">
            {t("footer_rights")}
          </p>
          <div className="text-[var(--muted-foreground)] text-sm">
            {t("footer_lang_note")}
          </div>
        </div>
      </div>
    </footer>
  );
}
