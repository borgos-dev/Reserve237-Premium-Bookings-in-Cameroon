"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { motion } from "motion/react";
import {
  RiStoreLine,
  RiLinksLine,
  RiLockLine,
  RiAlertLine,
  RiCheckLine,
  RiLoader4Line,
  RiEyeLine,
  RiEyeOffLine,
  RiInstagramLine,
  RiFacebookCircleLine,
  RiYoutubeLine,
  RiTwitterXLine,
  RiGlobalLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { SiTiktok } from "react-icons/si";
import { updateBusinessProfile, type UpdateBusinessInput } from "@/actions/businesses";
import { deleteBusinessAccount } from "@/actions/account";
import type { Business } from "@/db/schema/businesses";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsManagerProps {
  userId: string;
  userEmail: string;
  userName: string;
  business: Business | null;
}

type Tab = "profile" | "social" | "security" | "danger";

// ─── Location data ────────────────────────────────────────────────────────────

const CITIES = ["Yaounde", "Douala", "Limbe", "Bafoussam", "Bamenda", "Kribi"];

const NEIGHBORHOODS: Record<string, string[]> = {
  Yaounde: ["Bastos", "Mvan", "Omnisports", "Nlongkak", "Centre Ville", "Mvog-Mbi", "Biyem-Assi", "Nsimeyong", "Odza", "Emana"],
  Douala: ["Akwa", "Bonanjo", "Makepe", "Bonapriso", "Deido", "Logpom", "Bali", "Ndogbong", "Bonaberi", "Kotto"],
  Limbe: ["Down Beach", "Mile 4", "Bota", "GRA", "New Town"],
  Bafoussam: ["Kamkop", "Centre", "Tamdja", "Djeleng"],
  Bamenda: ["Commercial Avenue", "Up Station", "Nkwen", "Mile 4"],
  Kribi: ["Centre Ville", "Grand Batanga", "Afan Mabe"],
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-[#1F2A2A]/12 bg-[#F8F1EA] text-[#1F2A2A] placeholder:text-[#1F2A2A]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#13695A] focus:border-[#13695A] transition-all";

const labelCls =
  "block text-[10px] font-bold uppercase tracking-widest text-[#1F2A2A]/40 mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ─── Feedback banner ──────────────────────────────────────────────────────────

function Feedback({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-600 border border-red-200"
      }`}
    >
      {type === "success"
        ? <RiCheckLine className="w-4 h-4 shrink-0" />
        : <RiAlertLine className="w-4 h-4 shrink-0" />
      }
      {message}
    </motion.div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#1F2A2A]/8 rounded-xl shadow-[0_1px_2px_rgba(31,42,42,0.04),0_6px_20px_rgba(31,42,42,0.04)] p-6 space-y-5">
      <div>
        <h2 className="text-[#1F2A2A] font-semibold text-base tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-[#1F2A2A]/45 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsManager({ userId, userEmail, userName, business }: SettingsManagerProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useUser();

  const [tab, setTab] = useState<Tab>("profile");

  // ── Profile state ─────────────────────────────────────────────────────────

  const [profile, setProfile] = useState({
    name: business?.name ?? "",
    description: business?.description ?? "",
    city: business?.city ?? "",
    neighborhood: business?.neighborhood ?? "",
    landmark: business?.landmark ?? "",
    phone: business?.phone ?? "",
    whatsapp: business?.whatsapp ?? "",
    email: business?.email ?? "",
    website: business?.website ?? "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Social state ──────────────────────────────────────────────────────────

  const [social, setSocial] = useState({
    instagram: business?.instagram ?? "",
    facebook: business?.facebook ?? "",
    tiktok: business?.tiktok ?? "",
    youtube: business?.youtube ?? "",
    twitter: business?.twitter ?? "",
  });
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialFeedback, setSocialFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Password state ────────────────────────────────────────────────────────

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Delete state ──────────────────────────────────────────────────────────

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.name.trim()) return;
    setProfileSaving(true);
    setProfileFeedback(null);

    const input: UpdateBusinessInput = {
      userId,
      name: profile.name.trim(),
      description: profile.description || undefined,
      city: profile.city || undefined,
      neighborhood: profile.neighborhood || undefined,
      landmark: profile.landmark || undefined,
      phone: profile.phone || undefined,
      whatsapp: profile.whatsapp || undefined,
      email: profile.email || undefined,
      website: profile.website || undefined,
      // preserve existing social links
      instagram: social.instagram || undefined,
      facebook: social.facebook || undefined,
      tiktok: social.tiktok || undefined,
      youtube: social.youtube || undefined,
      twitter: social.twitter || undefined,
    };

    const result = await updateBusinessProfile(input);
    setProfileSaving(false);
    setProfileFeedback(
      result.success
        ? { type: "success", msg: t("set_profile_saved") }
        : { type: "error", msg: result.error ?? t("set_save_failed") }
    );
  }

  async function saveSocial(e: React.FormEvent) {
    e.preventDefault();
    setSocialSaving(true);
    setSocialFeedback(null);

    const input: UpdateBusinessInput = {
      userId,
      name: profile.name || business?.name || "My Business",
      instagram: social.instagram || undefined,
      facebook: social.facebook || undefined,
      tiktok: social.tiktok || undefined,
      youtube: social.youtube || undefined,
      twitter: social.twitter || undefined,
    };

    const result = await updateBusinessProfile(input);
    setSocialSaving(false);
    setSocialFeedback(
      result.success
        ? { type: "success", msg: t("set_social_saved") }
        : { type: "error", msg: result.error ?? t("set_save_failed") }
    );
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) {
      setPwdFeedback({ type: "error", msg: t("pw_mismatch") });
      return;
    }
    if (pwd.next.length < 8) {
      setPwdFeedback({ type: "error", msg: t("pw_too_short") });
      return;
    }
    setPwdSaving(true);
    setPwdFeedback(null);
    try {
      await (user as any)?.updatePassword({
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      setPwd({ current: "", next: "", confirm: "" });
      setPwdFeedback({ type: "success", msg: t("set_pwd_changed") });
    } catch (err: unknown) {
      const e = err as { errors?: { message: string }[]; message?: string };
      setPwdFeedback({
        type: "error",
        msg: e.errors?.[0]?.message ?? e.message ?? t("set_pwd_failed"),
      });
    } finally {
      setPwdSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    setDeleteFeedback(null);

    // 1. Delete DB data
    const result = await deleteBusinessAccount(userId);
    if (!result.success) {
      setDeleting(false);
      setDeleteFeedback({ type: "error", msg: result.error ?? t("set_delete_failed") });
      return;
    }

    // 2. Delete Clerk user
    try {
      await (user as any)?.delete();
      router.push("/");
    } catch (err: unknown) {
      const e = err as { errors?: { message: string }[]; message?: string };
      setDeleting(false);
      setDeleteFeedback({
        type: "error",
        msg: e.errors?.[0]?.message ?? t("set_delete_clerk_failed"),
      });
    }
  }

  // ── Tab config ────────────────────────────────────────────────────────────

  const TABS: { key: Tab; label: string; icon: typeof RiStoreLine }[] = [
    { key: "profile", label: t("set_tab_profile"), icon: RiStoreLine },
    { key: "social", label: t("set_tab_social"), icon: RiLinksLine },
    { key: "security", label: t("set_tab_security"), icon: RiLockLine },
    { key: "danger", label: t("set_tab_danger"), icon: RiAlertLine },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2A2A] mb-1">{t("dash_settings")}</h1>
        <p className="text-[#1F2A2A]/50 text-sm">{userEmail}</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-white border border-[#1F2A2A]/8 rounded-xl p-1 mb-6 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center ${
              tab === key
                ? key === "danger"
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-[#1F2A2A] text-white shadow-sm"
                : key === "danger"
                ? "text-red-500 hover:bg-red-50"
                : "text-[#1F2A2A]/55 hover:text-[#1F2A2A] hover:bg-[#1F2A2A]/5"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ─────────────────── TAB: Business profile ─────────────────── */}
      {tab === "profile" && (
        <form onSubmit={saveProfile}>
          <SectionCard
            title={t("set_tab_profile")}
            subtitle={t("set_profile_sub")}
          >
            {profileFeedback && <Feedback type={profileFeedback.type} message={profileFeedback.msg} />}

            <Field label={`${t("bsu_business_name")} *`}>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder={t("lm_name_ph")}
                className={inputCls}
              />
            </Field>

            <Field label={t("lm_description")}>
              <textarea
                rows={3}
                value={profile.description}
                onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                placeholder={t("bsu_description_ph")}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("city_label")}>
                <select
                  value={profile.city}
                  onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value, neighborhood: "" }))}
                  className={inputCls}
                >
                  <option value="">{t("bsu_select_city")}</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label={t("neighbourhood_label")}>
                <select
                  value={profile.neighborhood}
                  onChange={(e) => setProfile((p) => ({ ...p, neighborhood: e.target.value }))}
                  disabled={!profile.city}
                  className={`${inputCls} disabled:opacity-40`}
                >
                  <option value="">{t("bsu_select_neighbourhood")}</option>
                  {(NEIGHBORHOODS[profile.city] ?? []).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label={t("bsu_landmark")}>
              <div className="relative">
                <RiMapPinLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                <input
                  type="text"
                  value={profile.landmark}
                  onChange={(e) => setProfile((p) => ({ ...p, landmark: e.target.value }))}
                  placeholder="e.g. En face Total Bonapriso"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("lm_phone")}>
                <div className="relative">
                  <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+237 6XX XXX XXX"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>

              <Field label={t("bsu_whatsapp")}>
                <div className="relative">
                  <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                  <input
                    type="tel"
                    value={profile.whatsapp}
                    onChange={(e) => setProfile((p) => ({ ...p, whatsapp: e.target.value }))}
                    placeholder="+237 6XX XXX XXX"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("set_business_email")}>
                <div className="relative">
                  <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    placeholder="contact@yourbusiness.com"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>

              <Field label={t("set_website")}>
                <div className="relative">
                  <RiGlobalLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://yourbusiness.com"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileSaving || !profile.name.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#13695A] hover:bg-[#0A5C4A] text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {profileSaving
                  ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("lm_saving")}</>
                  : <><RiCheckLine className="w-4 h-4" /> {t("set_save_profile")}</>
                }
              </button>
            </div>
          </SectionCard>
        </form>
      )}

      {/* ─────────────────── TAB: Social media ─────────────────── */}
      {tab === "social" && (
        <form onSubmit={saveSocial}>
          <SectionCard
            title={t("set_social_title")}
            subtitle={t("set_social_sub")}
          >
            {socialFeedback && <Feedback type={socialFeedback.type} message={socialFeedback.msg} />}

            {[
              { key: "instagram" as const, label: "Instagram", icon: RiInstagramLine, placeholder: "https://instagram.com/yourbusiness" },
              { key: "facebook" as const, label: "Facebook", icon: RiFacebookCircleLine, placeholder: "https://facebook.com/yourbusiness" },
              { key: "youtube" as const, label: "YouTube", icon: RiYoutubeLine, placeholder: "https://youtube.com/@yourbusiness" },
              { key: "twitter" as const, label: "Twitter / X", icon: RiTwitterXLine, placeholder: "https://x.com/yourbusiness" },
            ].map(({ key, label, icon: Icon, placeholder }) => (
              <Field key={key} label={label}>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                  <input
                    type="url"
                    value={social[key]}
                    onChange={(e) => setSocial((s) => ({ ...s, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </Field>
            ))}

            {/* TikTok separately (different icon source) */}
            <Field label="TikTok">
              <div className="relative">
                <SiTiktok className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1F2A2A]/30 pointer-events-none" />
                <input
                  type="url"
                  value={social.tiktok}
                  onChange={(e) => setSocial((s) => ({ ...s, tiktok: e.target.value }))}
                  placeholder="https://tiktok.com/@yourbusiness"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </Field>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={socialSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#13695A] hover:bg-[#0A5C4A] text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {socialSaving
                  ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("lm_saving")}</>
                  : <><RiCheckLine className="w-4 h-4" /> {t("set_save_links")}</>
                }
              </button>
            </div>
          </SectionCard>
        </form>
      )}

      {/* ─────────────────── TAB: Security ─────────────────── */}
      {tab === "security" && (
        <div className="space-y-5">
          {/* Account info */}
          <SectionCard title={t("set_account_title")} subtitle={t("set_account_sub")}>
            <div className="flex items-center justify-between py-3 border-b border-[#1F2A2A]/8">
              <div>
                <p className={labelCls}>{t("set_signed_in_as")}</p>
                <p className="text-[#1F2A2A] text-sm font-medium">{userEmail}</p>
              </div>
            </div>
            {userName && (
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className={labelCls}>{t("set_name")}</p>
                  <p className="text-[#1F2A2A] text-sm font-medium">{userName}</p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Change password */}
          <form onSubmit={savePassword}>
            <SectionCard title={t("set_change_pwd")} subtitle={t("set_change_pwd_sub")}>
              {pwdFeedback && <Feedback type={pwdFeedback.type} message={pwdFeedback.msg} />}

              <Field label={t("set_current_pwd")}>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1F2A2A]/30 pointer-events-none" />
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    value={pwd.current}
                    onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                    placeholder={t("set_current_pwd_ph")}
                    className={`${inputCls} pl-10 pr-10`}
                  />
                  <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F2A2A]/30 hover:text-[#1F2A2A]/60 transition">
                    {showPwd ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t("fp_new_password")}>
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    minLength={8}
                    value={pwd.next}
                    onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                    placeholder={t("at_least_8_chars")}
                    className={inputCls}
                  />
                </Field>
                <Field label={t("fp_confirm_new")}>
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    value={pwd.confirm}
                    onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder={t("set_repeat_new")}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={pwdSaving || !pwd.current || !pwd.next || !pwd.confirm}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#13695A] hover:bg-[#0A5C4A] text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {pwdSaving
                    ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("lm_saving")}</>
                    : <><RiLockLine className="w-4 h-4" /> {t("set_change_pwd")}</>
                  }
                </button>
              </div>
            </SectionCard>
          </form>
        </div>
      )}

      {/* ─────────────────── TAB: Danger zone ─────────────────── */}
      {tab === "danger" && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-red-700 font-semibold text-base tracking-tight mb-1">
              {t("set_tab_danger")}
            </h2>
            <p className="text-red-600/70 text-xs">
              {t("set_danger_sub")}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-red-200">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold text-[#1F2A2A] text-sm">{t("set_delete_account")}</p>
                <p className="text-[#1F2A2A]/50 text-xs mt-1 max-w-sm leading-relaxed">
                  {t("set_delete_desc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors shrink-0"
              >
                <RiDeleteBinLine className="w-4 h-4" />
                {t("set_delete_btn")}
              </button>
            </div>
          </div>

          {deleteFeedback && <Feedback type={deleteFeedback.type} message={deleteFeedback.msg} />}
        </div>
      )}

      {/* ─────────────────── Delete confirmation modal ─────────────────── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-red-200"
          >
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <RiDeleteBinLine className="w-6 h-6 text-red-500" />
            </div>

            <h3 className="text-lg font-bold text-[#1F2A2A] mb-1">{t("set_delete_q")}</h3>
            <p className="text-[#1F2A2A]/55 text-sm mb-5 leading-relaxed">
              {t("set_delete_pre")} <strong>{business?.name}</strong>{t("set_delete_post")}
            </p>

            <div className="mb-5">
              <label className={labelCls}>{t("set_type_delete")}</label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 placeholder:text-red-300 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-400 transition-all text-center"
              />
            </div>

            {deleteFeedback && <Feedback type={deleteFeedback.type} message={deleteFeedback.msg} />}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => { setDeleteModal(false); setDeleteConfirm(""); setDeleteFeedback(null); }}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-[#1F2A2A]/12 text-[#1F2A2A] text-sm font-medium hover:bg-[#1F2A2A]/5 transition-colors disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {deleting
                  ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("set_deleting")}</>
                  : <><RiDeleteBinLine className="w-4 h-4" /> {t("set_delete_confirm_btn")}</>
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
