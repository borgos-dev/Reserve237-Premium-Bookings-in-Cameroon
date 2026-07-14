"use client";

import { motion } from "motion/react";
import { RiFacebookFill, RiInstagramLine, RiTwitterXLine, RiLinkedinFill } from "react-icons/ri";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

const socialLinks = [
  { icon: RiFacebookFill, href: "#", label: "Facebook" },
  { icon: RiInstagramLine, href: "#", label: "Instagram" },
  { icon: RiTwitterXLine, href: "#", label: "Twitter" },
  { icon: RiLinkedinFill, href: "#", label: "LinkedIn" },
];

const footerLinks: { title: TranslationKey; links: TranslationKey[] }[] = [
  { title: "footer_explore", links: ["footer_restaurants", "footer_lounges", "footer_nightlife", "footer_guest_houses", "footer_event_spaces"] },
  { title: "footer_partners", links: ["footer_dashboard", "footer_list_business", "footer_pricing", "footer_resources"] },
  { title: "footer_company", links: ["footer_about", "nav_contact", "privacy_policy", "terms_of_service"] },
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
              <img src="/Reserve237-logo.png" alt="Reserve237" className="h-24 sm:h-28 w-auto max-w-[220px] object-contain" />
            </div>
            <p className="text-[var(--muted-foreground)] text-sm mb-6">
              {t("footer_tagline")}
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] rounded-xl flex items-center justify-center transition-all"
                >
                  <Icon className="w-4 h-4 text-[var(--muted-foreground)]" />
                </a>
              ))}
            </div>
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
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors text-sm">
                      {t(link)}
                    </a>
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
