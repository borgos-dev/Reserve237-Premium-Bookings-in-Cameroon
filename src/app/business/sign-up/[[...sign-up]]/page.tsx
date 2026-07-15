"use client";

import { useState, useEffect, useRef } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine,
  RiLoader4Line,
  RiRestaurantLine,
  RiGobletLine,
  RiScissorsLine,
  RiCalendarEventLine,
  RiHotelBedLine,
  RiCarLine,
  RiMapPinLine,
  RiMailLine,
  RiPhoneLine,
} from "react-icons/ri";
import { setupBusinessProfile } from "@/actions/businesses";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    value: "food-drinks",
    label: "cat_food_drinks" as TranslationKey,
    sublabel: "bsu_cat_food_sub" as TranslationKey,
    icon: RiRestaurantLine,
    bg: "bg-amber-50 border-amber-200 hover:border-amber-400",
    selected: "bg-amber-50 border-amber-500 ring-2 ring-amber-300",
    iconCls: "text-amber-600",
    check: "bg-amber-500",
  },
  {
    value: "nightlife",
    label: "cat_nightlife" as TranslationKey,
    sublabel: "bsu_cat_nightlife_sub" as TranslationKey,
    icon: RiGobletLine,
    bg: "bg-purple-50 border-purple-200 hover:border-purple-400",
    selected: "bg-purple-50 border-purple-500 ring-2 ring-purple-300",
    iconCls: "text-purple-600",
    check: "bg-purple-500",
  },
  {
    value: "beauty-wellness",
    label: "cat_beauty_wellness" as TranslationKey,
    sublabel: "bsu_cat_beauty_sub" as TranslationKey,
    icon: RiScissorsLine,
    bg: "bg-pink-50 border-pink-200 hover:border-pink-400",
    selected: "bg-pink-50 border-pink-500 ring-2 ring-pink-300",
    iconCls: "text-pink-600",
    check: "bg-pink-500",
  },
  {
    value: "events-venues",
    label: "cat_events_venues" as TranslationKey,
    sublabel: "bsu_cat_events_sub" as TranslationKey,
    icon: RiCalendarEventLine,
    bg: "bg-blue-50 border-blue-200 hover:border-blue-400",
    selected: "bg-blue-50 border-blue-500 ring-2 ring-blue-300",
    iconCls: "text-blue-600",
    check: "bg-blue-500",
  },
  {
    value: "accommodation",
    label: "cat_accommodation" as TranslationKey,
    sublabel: "bsu_cat_accom_sub" as TranslationKey,
    icon: RiHotelBedLine,
    bg: "bg-teal-50 border-teal-200 hover:border-teal-400",
    selected: "bg-teal-50 border-[#13695A] ring-2 ring-[#13695A]/30",
    iconCls: "text-[#13695A]",
    check: "bg-[#13695A]",
  },
  {
    value: "transport-more",
    label: "cat_transport_more" as TranslationKey,
    sublabel: "bsu_cat_transport_sub" as TranslationKey,
    icon: RiCarLine,
    bg: "bg-green-50 border-green-200 hover:border-green-400",
    selected: "bg-green-50 border-green-600 ring-2 ring-green-300",
    iconCls: "text-green-600",
    check: "bg-green-600",
  },
];

const SUB_TYPES: Record<string, { value: string; en: string; fr: string }[]> = {
  "food-drinks": [
    { value: "restaurant", en: "Restaurant", fr: "Restaurant" },
    { value: "snack-bar", en: "Snack Bar", fr: "Snack-bar" },
    { value: "cafe", en: "Café / Coffee Shop", fr: "Café" },
    { value: "fast-food", en: "Fast Food", fr: "Fast-food" },
    { value: "bakery", en: "Bakery / Pâtisserie", fr: "Boulangerie / Pâtisserie" },
  ],
  nightlife: [
    { value: "nightclub", en: "Night Club", fr: "Boîte de nuit" },
    { value: "lounge", en: "Lounge", fr: "Lounge" },
    { value: "bar", en: "Bar", fr: "Bar" },
    { value: "rooftop-bar", en: "Rooftop Bar", fr: "Bar rooftop" },
    { value: "sports-bar", en: "Sports Bar", fr: "Bar sportif" },
  ],
  "beauty-wellness": [
    { value: "salon", en: "Hair Salon", fr: "Salon de coiffure" },
    { value: "barbershop", en: "Barbershop", fr: "Barbier" },
    { value: "spa", en: "Spa", fr: "Spa" },
    { value: "nail-studio", en: "Nail Studio", fr: "Onglerie" },
    { value: "massage-center", en: "Massage Center", fr: "Centre de massage" },
  ],
  "events-venues": [
    { value: "wedding-hall", en: "Wedding Hall", fr: "Salle de mariage" },
    { value: "conference-room", en: "Conference / Meeting Room", fr: "Salle de conférence / réunion" },
    { value: "outdoor-venue", en: "Outdoor Venue", fr: "Espace extérieur" },
    { value: "theatre", en: "Theatre / Concert Hall", fr: "Théâtre / Salle de concert" },
    { value: "stadium", en: "Stadium / Sports Arena", fr: "Stade / Arène sportive" },
  ],
  accommodation: [
    { value: "hotel", en: "Hotel", fr: "Hôtel" },
    { value: "guesthouse", en: "Guest House", fr: "Maison d'hôtes" },
    { value: "villa", en: "Villa / Private House", fr: "Villa / Maison privée" },
    { value: "apartment", en: "Serviced Apartment", fr: "Appartement meublé" },
    { value: "hostel", en: "Hostel / Budget Stay", fr: "Auberge / Petit budget" },
  ],
  "transport-more": [
    { value: "car-hire", en: "Car Hire", fr: "Location de voiture" },
    { value: "tour-operator", en: "Tour Operator", fr: "Tour opérateur" },
    { value: "clinic", en: "Clinic / Medical Center", fr: "Clinique / Centre médical" },
    { value: "pharmacy", en: "Pharmacy", fr: "Pharmacie" },
    { value: "travel-agency", en: "Travel Agency", fr: "Agence de voyage" },
  ],
};

const NAME_PLACEHOLDERS: Record<string, string> = {
  restaurant:        "e.g. Mama Pauline Restaurant, Bonapriso",
  "snack-bar":       "e.g. Snack Chez Maman, Akwa",
  cafe:              "e.g. Café du Plateau, Centre Ville",
  "fast-food":       "e.g. Douala Fast Bites, Deido",
  bakery:            "e.g. Pâtisserie Belle Vue, Bastos",
  nightclub:         "e.g. Sky Lounge Bastos",
  lounge:            "e.g. Terrace 237, Omnisports",
  bar:               "e.g. Le Balafon Bar, Bali",
  "rooftop-bar":     "e.g. Rooftop One, Plateau",
  "sports-bar":      "e.g. Champions Bar, Akwa",
  salon:             "e.g. Salon Élégance, Makepe",
  barbershop:        "e.g. Barber King, Bonapriso",
  spa:               "e.g. Zen Spa Yaoundé, Bastos",
  "nail-studio":     "e.g. Nails by Sandra, Biyem-Assi",
  "massage-center":  "e.g. Détente Massage, Bonanjo",
  "wedding-hall":    "e.g. Salle Royale des Palmiers, Centre Ville",
  "conference-room": "e.g. Espace Business Douala, Bonanjo",
  "outdoor-venue":   "e.g. Jardin des Événements, Nlongkak",
  theatre:           "e.g. Théâtre du Wouri, Akwa",
  stadium:           "e.g. Complexe Sportif Omnisports",
  hotel:             "e.g. Résidence Le Paradis, Bastos",
  guesthouse:        "e.g. Villa Serenity, Bonapriso",
  villa:             "e.g. Villa Tranquille, Limbe",
  apartment:         "e.g. Appartements Meublés Central, Akwa",
  hostel:            "e.g. Yaoundé Budget Stay, Mvan",
  "car-hire":        "e.g. Douala Car Rentals",
  "tour-operator":   "e.g. Cameroon Adventures Tours",
  clinic:            "e.g. Clinique Espoir, Makepe",
  pharmacy:          "e.g. Pharmacie du Carrefour, Bastos",
  "travel-agency":   "e.g. Voyages Express Cameroun",
};

const CITIES = ["Yaounde", "Douala", "Limbe", "Bafoussam", "Bamenda", "Kribi"];

const NEIGHBORHOODS: Record<string, string[]> = {
  Yaounde: ["Bastos", "Mvan", "Omnisports", "Nlongkak", "Centre Ville", "Mvog-Mbi", "Biyem-Assi", "Nsimeyong", "Odza", "Emana"],
  Douala: ["Akwa", "Bonanjo", "Makepe", "Bonapriso", "Deido", "Logpom", "Bali", "Ndogbong", "Bonaberi", "Kotto"],
  Limbe: ["Down Beach", "Mile 4", "Bota", "GRA", "New Town"],
  Bafoussam: ["Kamkop", "Centre", "Tamdja", "Djeleng"],
  Bamenda: ["Commercial Avenue", "Up Station", "Nkwen", "Mile 4"],
  Kribi: ["Centre Ville", "Grand Batanga", "Afan Mabe"],
};

const STEP_LABELS: TranslationKey[] = ["bsu_step_category", "bsu_step_details", "bsu_step_account", "bsu_step_verify"];
const TOTAL_STEPS = 4;

// ─── Shared input class ───────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-[#1F2A2A]/15 bg-[#F8F1EA]/60 text-[#1F2A2A] placeholder:text-[#1F2A2A]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#13695A] focus:border-[#13695A] transition-all";

// ─── Component ────────────────────────────────────────────────────────────────

export default function BusinessSignUpPage() {
  const { t, lang } = useLanguage();
  // Clerk v7 signals API: methods return { error } instead of throwing,
  // and finalize() activates the newly created session.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { signUp } = useSignUp() as any;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 state
  const [category, setCategory] = useState("");

  // Step 2 state
  const [biz, setBiz] = useState({
    name: "", subType: "", city: "", neighborhood: "",
    landmark: "", description: "", phone: "", whatsapp: "",
  });
  const [samePhone, setSamePhone] = useState(true);

  // Step 3 state
  const [account, setAccount] = useState({ email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);

  // Step 4 state
  const [code, setCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current!);
  }, [resendCooldown]);

  // ── Field helpers ─────────────────────────────────────────────────────────────

  const clearError = () => setError("");

  const bizField = (key: keyof typeof biz) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setBiz((p) => ({ ...p, [key]: e.target.value }));
      clearError();
    };

  const accField = (key: keyof typeof account) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAccount((p) => ({ ...p, [key]: e.target.value }));
      clearError();
    };

  // ── Navigation ────────────────────────────────────────────────────────────────

  const goNext = () => { clearError(); setStep((s) => s + 1); };
  const goBack = () => { clearError(); setStep((s) => s - 1); };

  function handleCategoryNext() {
    if (!category) return setError(t("bsu_err_choose_category"));
    goNext();
  }

  function handleDetailsNext() {
    if (!biz.subType) return setError(t("bsu_err_subtype"));
    if (!biz.name.trim()) return setError(t("bsu_err_name"));
    if (!biz.city) return setError(t("bsu_err_city"));
    if (!biz.neighborhood) return setError(t("bsu_err_neighbourhood"));
    if (!biz.landmark.trim()) return setError(t("bsu_err_landmark"));
    goNext();
  }

  // Keep whatsapp in sync when samePhone is on
  function handlePhoneChange(val: string) {
    setBiz((p) => ({ ...p, phone: val, whatsapp: samePhone ? val : p.whatsapp }));
    clearError();
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp) return setError(t("err_auth_not_ready"));
    if (account.password.length < 8) return setError(t("pw_too_short"));
    if (account.password !== account.confirm) return setError(t("pw_mismatch"));

    setLoading(true);
    clearError();
    try {
      const { error: createError } = await signUp.create({
        emailAddress: account.email,
        password: account.password,
        unsafeMetadata: {
          role: "partner",
          businessName: biz.name,
          mainCategory: category,
          subType: biz.subType,
          city: biz.city,
          neighborhood: biz.neighborhood,
          landmark: biz.landmark,
          description: biz.description,
          phone: biz.phone,
          whatsapp: samePhone ? biz.phone : biz.whatsapp,
        },
      });
      if (createError) {
        setError(createError.message ?? t("bsu_err_create"));
        return;
      }
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(sendError.message ?? t("bsu_err_create"));
        return;
      }
      goNext();
    } catch (err: unknown) {
      const e = err as { errors?: { message: string }[]; message?: string };
      setError(e.errors?.[0]?.message ?? e.message ?? t("bsu_err_create"));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp) return setError(t("err_auth_not_ready"));

    setLoading(true);
    clearError();
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        setError(verifyError.message ?? t("bsu_err_invalid_code"));
        return;
      }

      // Activate the new session
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setError(t("bsu_err_verify_incomplete"));
        return;
      }

      const createdUserId: string | null = signUp.createdUserId;

      // Then save business profile to DB
      if (createdUserId) {
        await setupBusinessProfile({
          userId: createdUserId,
          email: account.email,
          name: biz.name,
          mainCategory: category,
          subType: biz.subType || undefined,
          city: biz.city,
          neighborhood: biz.neighborhood,
          landmark: biz.landmark,
          description: biz.description || undefined,
          phone: biz.phone || undefined,
          whatsapp: (samePhone ? biz.phone : biz.whatsapp) || undefined,
        });
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { errors?: { message: string }[]; message?: string };
      setError(e.errors?.[0]?.message ?? e.message ?? t("bsu_err_invalid_code"));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!signUp || loading || resendCooldown > 0) return;
    setLoading(true);
    clearError();
    try {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) setError(t("bsu_err_resend"));
      else setResendCooldown(60); // 60-second cooldown after resend
    } catch {
      setError(t("bsu_err_resend"));
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#F8F1EA] flex flex-col">

      {/* ── Header ── */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-[#1F2A2A]/10 bg-[#F8F1EA]">
        <Link
          href="/business"
          className="flex items-center gap-1.5 text-[#1F2A2A]/50 hover:text-[#1F2A2A] text-sm transition-colors"
        >
          <RiArrowLeftLine className="w-4 h-4" />
          {t("bsu_back")}
        </Link>
        <Link href="/">
          <img src="/Reserve237-logo.png" alt="Reserve237" className="h-10 w-auto object-contain" />
        </Link>
        <Link href="/business/sign-in" className="text-sm text-[#13695A] hover:underline font-medium">
          {t("nav_login")}
        </Link>
      </header>

      {/* ── Progress bar ── */}
      <div className="w-full h-1 bg-[#1F2A2A]/8">
        <motion.div
          className="h-full bg-[#13695A]"
          initial={false}
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* ── Step pills ── */}
      <div className="flex justify-center gap-8 py-4">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done
                  ? "bg-[#13695A] text-white"
                  : active
                  ? "bg-[#1F2A2A] text-white"
                  : "bg-[#1F2A2A]/12 text-[#1F2A2A]/35"
              }`}>
                {done ? <RiCheckLine className="w-4 h-4" /> : n}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide hidden sm:block transition-colors ${
                active ? "text-[#1F2A2A]" : "text-[#1F2A2A]/35"
              }`}>
                {t(label)}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-6 pb-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">

            {/* ─────────────────────────── STEP 1: Category ─────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.28 }}
              >
                <div className="text-center mb-7">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2A2A] mb-2">
                    {t("bsu_s1_title")}
                  </h1>
                  <p className="text-[#1F2A2A]/50 text-sm">
                    {t("bsu_s1_subtitle")}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const sel = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => { setCategory(cat.value); clearError(); }}
                        className={`relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          sel ? cat.selected : cat.bg
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                          <Icon className={`w-6 h-6 ${cat.iconCls}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1F2A2A] text-sm leading-tight">{t(cat.label)}</p>
                          <p className="text-[#1F2A2A]/45 text-xs mt-0.5 leading-snug">{t(cat.sublabel)}</p>
                        </div>
                        {sel && (
                          <span className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${cat.check}`}>
                            <RiCheckLine className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}

                <button
                  onClick={handleCategoryNext}
                  className="w-full py-3.5 rounded-2xl bg-[#1F2A2A] hover:bg-[#13695A] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {t("continue_label")} <RiArrowRightLine className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ─────────────────────────── STEP 2: Details ─────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.28 }}
              >
                <div className="text-center mb-7">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2A2A] mb-2">
                    {t("bsu_s2_title")}
                  </h1>
                  <p className="text-[#1F2A2A]/50 text-sm">
                    {t("bsu_s2_subtitle")}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#1F2A2A]/8 space-y-5">

                  {/* Sub-type */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                      {t("bsu_subtype_label")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={biz.subType}
                      onChange={bizField("subType")}
                      className={inputCls}
                    >
                      <option value="">{t("bsu_select_type")}</option>
                      {(SUB_TYPES[category] ?? []).map((s) => (
                        <option key={s.value} value={s.value}>{lang === "fr" ? s.fr : s.en}</option>
                      ))}
                    </select>
                  </div>

                  {/* Business name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                      {t("bsu_business_name")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={biz.name}
                      onChange={bizField("name")}
                      placeholder={NAME_PLACEHOLDERS[biz.subType] ?? "e.g. Mama Pauline Restaurant, Bonapriso"}
                      className={inputCls}
                    />
                  </div>

                  {/* City + Neighbourhood */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                        {t("city_label")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={biz.city}
                        onChange={(e) => {
                          setBiz((p) => ({ ...p, city: e.target.value, neighborhood: "" }));
                          clearError();
                        }}
                        className={inputCls}
                      >
                        <option value="">{t("bsu_select_city")}</option>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                        {t("neighbourhood_label")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={biz.neighborhood}
                        onChange={bizField("neighborhood")}
                        disabled={!biz.city}
                        className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <option value="">{t("bsu_select_neighbourhood")}</option>
                        {(NEIGHBORHOODS[biz.city] ?? []).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                      {t("bsu_landmark")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RiMapPinLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                      <input
                        type="text"
                        value={biz.landmark}
                        onChange={bizField("landmark")}
                        placeholder={t("bsu_landmark_ph")}
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                    <p className="text-[10px] text-[#1F2A2A]/35 mt-1.5 leading-snug">
                      {t("bsu_landmark_hint")}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                      {t("phone_number")}{" "}
                      <span className="normal-case tracking-normal font-normal text-[#1F2A2A]/30">({t("optional")})</span>
                    </label>
                    <div className="relative">
                      <RiPhoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                      <input
                        type="tel"
                        value={biz.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45">
                        {t("bsu_whatsapp")}{" "}
                        <span className="normal-case tracking-normal font-normal text-[#1F2A2A]/30">({t("optional")})</span>
                      </label>
                      {/* Same as phone toggle */}
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <div
                          onClick={() => {
                            setSamePhone((s) => {
                              if (!s) setBiz((p) => ({ ...p, whatsapp: p.phone }));
                              return !s;
                            });
                          }}
                          className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${samePhone ? "bg-[#13695A]" : "bg-[#1F2A2A]/20"}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${samePhone ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                        <span className="text-[10px] text-[#1F2A2A]/45 font-medium">{t("bsu_same_phone")}</span>
                      </label>
                    </div>
                    <div className="relative">
                      <RiPhoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                      <input
                        type="tel"
                        value={samePhone ? biz.phone : biz.whatsapp}
                        onChange={samePhone ? undefined : bizField("whatsapp")}
                        readOnly={samePhone}
                        placeholder="+237 6XX XXX XXX"
                        className={`${inputCls} pl-10 ${samePhone ? "opacity-50 cursor-not-allowed" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                      {t("bsu_description")}{" "}
                      <span className="normal-case tracking-normal font-normal text-[#1F2A2A]/30">({t("optional")})</span>
                    </label>
                    <textarea
                      rows={3}
                      value={biz.description}
                      onChange={bizField("description")}
                      placeholder={t("bsu_description_ph")}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}

                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={goBack}
                    className="px-5 py-3.5 rounded-2xl border border-[#1F2A2A]/15 bg-white text-[#1F2A2A] text-sm font-medium hover:bg-[#1F2A2A]/5 transition-colors"
                  >
                    <RiArrowLeftLine className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDetailsNext}
                    className="flex-1 py-3.5 rounded-2xl bg-[#1F2A2A] hover:bg-[#13695A] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {t("continue_label")} <RiArrowRightLine className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─────────────────────────── STEP 3: Account ─────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.28 }}
              >
                <div className="text-center mb-7">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2A2A] mb-2">
                    {t("create_account")}
                  </h1>
                  <p className="text-[#1F2A2A]/50 text-sm">
                    {t("bsu_s3_subtitle")}
                  </p>
                </div>

                <form onSubmit={handleCreateAccount} className="bg-white rounded-3xl p-6 shadow-sm border border-[#1F2A2A]/8 space-y-5">

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                      {t("email_address")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={account.email}
                        onChange={accField("email")}
                        placeholder="your@business.com"
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                      {t("password")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        minLength={8}
                        value={account.password}
                        onChange={accField("password")}
                        placeholder={t("at_least_8_chars")}
                        className={`${inputCls} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1F2A2A]/35 hover:text-[#1F2A2A]/70 transition"
                      >
                        {showPass ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-1.5">
                      {t("confirm_password")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={account.confirm}
                      onChange={accField("confirm")}
                      placeholder={t("repeat_password")}
                      className={inputCls}
                    />
                  </div>

                  <p className="text-[11px] text-[#1F2A2A]/30 text-center leading-snug">
                    {t("terms_agreement")}{" "}
                    <Link href="/terms" target="_blank" className="underline hover:text-[#13695A] transition-colors">
                      {t("terms_of_service")}
                    </Link>
                    {" "}{t("and")}{" "}
                    <Link href="/privacy" target="_blank" className="underline hover:text-[#13695A] transition-colors">
                      {t("privacy_policy")}
                    </Link>.
                  </p>

                  {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                  {/* Clerk bot-protection (Turnstile) mounts here — required for custom sign-up flows */}
                  <div id="clerk-captcha" className="empty:hidden" />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className="px-5 py-3.5 rounded-2xl border border-[#1F2A2A]/15 bg-[#F8F1EA] text-[#1F2A2A] text-sm font-medium hover:bg-[#1F2A2A]/5 transition-colors"
                    >
                      <RiArrowLeftLine className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !account.email || !account.password || !account.confirm}
                      className="flex-1 py-3.5 rounded-2xl bg-[#1F2A2A] hover:bg-[#13695A] text-white font-semibold text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {loading
                        ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("creating_account")}</>
                        : <>{t("create_account_btn")} <RiArrowRightLine className="w-4 h-4" /></>
                      }
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ─────────────────────────── STEP 4: Verify ─────────────────────────── */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.28 }}
              >
                <div className="text-center mb-7">
                  <div className="w-16 h-16 bg-[#13695A]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <RiMailLine className="w-8 h-8 text-[#13695A]" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2A2A] mb-2">
                    {t("check_email")}
                  </h1>
                  <p className="text-[#1F2A2A]/50 text-sm">
                    {t("code_sent_to")}{" "}
                    <span className="font-semibold text-[#1F2A2A]">{account.email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="bg-white rounded-3xl p-8 shadow-sm border border-[#1F2A2A]/8 space-y-5">

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[#1F2A2A]/45 mb-3 text-center">
                      {t("verification_code")}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError(); }}
                      placeholder="000000"
                      className="w-full px-4 py-4 rounded-xl border-2 border-[#1F2A2A]/15 bg-[#F8F1EA]/60 text-[#1F2A2A] text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#13695A] focus:border-[#13695A] transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="w-full py-4 rounded-2xl bg-[#13695A] hover:bg-[#0A5C4A] text-white font-semibold text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("verifying")}</>
                      : <><RiCheckLine className="w-4 h-4" /> {t("bsu_verify_open")}</>
                    }
                  </button>

                  {/* Resend with cooldown */}
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={loading || resendCooldown > 0}
                    className="w-full text-center text-sm text-[#1F2A2A]/35 hover:text-[#1F2A2A]/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `${t("resend_in")} ${resendCooldown}s`
                      : <>{t("didnt_receive")} <span className="underline font-medium">{t("resend")}</span></>
                    }
                  </button>

                  {/* Wrong email escape */}
                  <button
                    type="button"
                    onClick={() => { goBack(); setCode(""); clearError(); }}
                    className="w-full text-center text-xs text-[#1F2A2A]/25 hover:text-[#1F2A2A]/50 transition-colors"
                  >
                    {t("wrong_email")}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-xs text-[#1F2A2A]/30 mt-8">
            {t("bsu_already_partner")}{" "}
            <Link href="/business/sign-in" className="text-[#13695A] hover:underline font-medium">
              {t("bsu_signin_dashboard")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
