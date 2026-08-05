"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { RiShieldCheckLine } from "react-icons/ri";
import { useLanguage } from "@/contexts/LanguageContext";

// First-visit notice linking Terms & Privacy — dismissed once, remembered
// per browser. Bump the key suffix if the policies materially change.
const STORAGE_KEY = "r237-consent-v1";

export function ConsentBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return; // storage unavailable — never nag on every page view
    }
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[60]"
          role="dialog"
          aria-live="polite"
          aria-label={t("consent_title")}
        >
          <div className="card shadow-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                <RiShieldCheckLine className="h-5 w-5 text-[var(--primary)]" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm mb-1">{t("consent_title")}</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {t("consent_text_1")}{" "}
                  <Link href="/terms" className="text-[var(--primary)] font-medium hover:underline">
                    {t("terms_of_service")}
                  </Link>{" "}
                  {t("consent_text_2")}{" "}
                  <Link href="/privacy" className="text-[var(--primary)] font-medium hover:underline">
                    {t("privacy_policy")}
                  </Link>
                  .
                </p>
              </div>
            </div>
            <button
              onClick={accept}
              className="btn-primary w-full mt-4 py-2.5 text-sm font-semibold"
            >
              {t("consent_accept")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
