"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { RiShieldLine, RiFlashlightLine, RiLineChartLine, RiTeamLine } from "react-icons/ri";
import { useLanguage } from "@/contexts/LanguageContext";

export function NewBusinessCTA() {
  const { lang } = useLanguage();

  const features = lang === "fr" ? [
    { icon: RiShieldLine,      title: "Gagnez la confiance",    description: "Badge de vérification affiché sur votre annonce" },
    { icon: RiFlashlightLine,  title: "Configuration rapide",    description: "Listez votre entreprise en moins de 10 minutes" },
    { icon: RiLineChartLine,   title: "Augmentez vos revenus",   description: "Remplissez vos créneaux vides sans effort" },
    { icon: RiTeamLine,        title: "Clients de qualité",      description: "Accédez à une audience engagée et vérifiée" },
  ] : [
    { icon: RiShieldLine,      title: "Build Trust",             description: "Verified badge system for all partners" },
    { icon: RiFlashlightLine,  title: "Easy Setup",              description: "List your business in under 10 minutes" },
    { icon: RiLineChartLine,   title: "Grow Revenue",            description: "Fill empty slots effortlessly" },
    { icon: RiTeamLine,        title: "Quality Customers",       description: "Access vetted, engaged audience" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--surface-1)] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[var(--primary)] rounded-full blur-[128px] opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--primary)] rounded-full blur-[128px] opacity-10 animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {lang === "fr" ? "Développez votre activité avec nous" : "Grow Your Business With Us"}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
            {lang === "fr"
              ? "Rejoignez des partenaires vérifiés qui développent leur activité avec Reserve237"
              : "Join verified partners earning with Reserve237"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="card"
              >
                <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--muted-foreground)] text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex justify-center"
        >
          <Link
            href="/business/sign-up"
            className="px-10 py-4 bg-[var(--primary)] hover:bg-[#0A5C4A] text-[var(--primary-foreground)] rounded-2xl shadow-2xl text-lg font-semibold transition-all"
          >
            {lang === "fr" ? "Devenir partenaire" : "Become a Partner"}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
