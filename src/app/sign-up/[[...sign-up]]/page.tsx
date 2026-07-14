"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  RiMailLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightLine,
  RiCheckLine,
  RiLoader4Line,
  RiUserLine,
  RiPhoneLine,
  RiMapPinLine,
  RiHeartLine,
  RiShieldCheckLine,
  RiHandCoinLine,
} from "react-icons/ri";
import { useLanguage } from "@/contexts/LanguageContext";

// Benefits built inside component to use translations

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}

function SignUpContent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { signUp, isLoaded } = useSignUp() as any;
  const { setActive } = useClerk();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const BENEFITS = [
    { icon: RiMapPinLine, title: t("benefit_book_title"), desc: t("benefit_book_desc") },
    { icon: RiShieldCheckLine, title: t("benefit_verified_title"), desc: t("benefit_verified_desc") },
    { icon: RiHandCoinLine, title: t("benefit_momo_title"), desc: t("benefit_momo_desc") },
    { icon: RiHeartLine, title: t("benefit_save_title"), desc: t("benefit_save_desc") },
  ];

  const [step, setStep] = useState<"form" | "verify">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
  });

  // Verification
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

  const f = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      setError("");
    };

  // ── Step 1: create account + send verification ──────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");

    setLoading(true);
    setError("");
    try {
      await signUp.create({
        firstName: form.firstName.trim(),
        emailAddress: form.email,
        password: form.password,
        ...(form.phone && { unsafeMetadata: { phone: form.phone } }),
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const e = err as { errors?: { message: string }[]; message?: string };
      setError(e.errors?.[0]?.message ?? e.message ?? "Could not create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: verify email ─────────────────────────────────────────────────────

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message: string }[]; message?: string };
      setError(e.errors?.[0]?.message ?? e.message ?? "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!signUp || loading || resendCooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCooldown(60);
    } catch {
      setError("Could not resend code.");
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col lg:flex-row">

      {/* ── Left panel — brand + benefits (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-between bg-[#1F2A2A] text-[#F8F1EA] p-12">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/Reserve237-logo.png"
            alt="Reserve237"
            width={160}
            height={60}
            className="h-14 w-auto object-contain brightness-200"
            unoptimized
          />
        </Link>

        {/* Headline + benefits */}
        <div className="space-y-10">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-3">
              {t("left_panel_headline")}
              <br />
              <span className="text-[#E8B923]">{t("left_panel_headline2")}</span>
            </h1>
            <p className="text-[#F8F1EA]/60 text-base leading-relaxed">
              {t("left_panel_subtitle")}
            </p>
          </div>

          <div className="space-y-6">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#13695A] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-[#F8F1EA]/50 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment logos */}
        <div className="flex items-center gap-3">
          <span className="text-[#F8F1EA]/40 text-xs">{t("payments_via")}</span>
          <div className="bg-white rounded-lg px-2.5 py-1.5">
            <Image src="/mtn%20logo%20momo.png" alt="MTN MoMo" width={52} height={20} className="h-5 w-auto object-contain" unoptimized />
          </div>
          <div className="bg-white rounded-lg px-2.5 py-1.5">
            <Image src="/orange-money-logo-png_seeklogo-440383.png" alt="Orange Money" width={52} height={20} className="h-5 w-auto object-contain" unoptimized />
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <Link href="/">
            <img src="/Reserve237-logo.png" alt="Reserve237" className="h-10 w-auto object-contain" />
          </Link>
          <Link href="/sign-in" className="text-sm text-[var(--primary)] font-medium hover:underline">
            Sign in
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {step === "form" ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1.5">{t("create_account")}</h2>
                  <p className="text-[var(--muted-foreground)] text-sm">
                    {t("create_account_subtitle")}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* First name */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("first_name")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={f("firstName")}
                        placeholder={t("first_name_placeholder")}
                        className="input-field pl-10 w-full"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("email_address")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={f("email")}
                        placeholder="you@example.com"
                        className="input-field pl-10 w-full"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("password")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        minLength={8}
                        value={form.password}
                        onChange={f("password")}
                        placeholder={t("at_least_8_chars")}
                        className="input-field pl-10 pr-10 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {showPass ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("confirm_password")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        value={form.confirm}
                        onChange={f("confirm")}
                        placeholder={t("repeat_password")}
                        className="input-field pl-10 w-full"
                      />
                    </div>
                  </div>

                  {/* Phone (optional) */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {t("phone_optional_label")}{" "}
                      <span className="text-[var(--muted-foreground)] font-normal text-xs">{t("phone_optional_hint")}</span>
                    </label>
                    <div className="relative">
                      <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={f("phone")}
                        placeholder="+237 6XX XXX XXX"
                        className="input-field pl-10 w-full"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2 rounded-xl">
                      {error}
                    </p>
                  )}

                  <p className="text-[11px] text-[var(--muted-foreground)] leading-snug">
                    {t("terms_agreement")}{" "}
                    <Link href="/terms" target="_blank" className="underline hover:text-[var(--primary)] transition-colors">
                      {t("terms_of_service")}
                    </Link>
                    {" "}{t("and")}{" "}
                    <Link href="/privacy" target="_blank" className="underline hover:text-[var(--primary)] transition-colors">
                      {t("privacy_policy")}
                    </Link>.
                  </p>

                  <button
                    type="submit"
                    disabled={loading || !form.firstName || !form.email || !form.password || !form.confirm}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading
                      ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("creating_account")}</>
                      : <>{t("create_account_btn")} <RiArrowRightLine className="w-4 h-4" /></>
                    }
                  </button>
                </form>

                <div className="mt-6 space-y-2 text-center text-sm text-[var(--muted-foreground)]">
                  <p>
                    {t("already_have_account")}{" "}
                    <Link href="/sign-in" className="text-[var(--primary)] hover:underline font-medium">
                      {t("sign_in")}
                    </Link>
                  </p>
                  <p>
                    {t("registering_business")}{" "}
                    <Link href="/business/sign-up" className="text-[var(--primary)] hover:underline font-medium">
                      {t("partner_signup")}
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              /* ── Email verification ── */
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <RiMailLine className="w-8 h-8 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{t("check_email")}</h2>
                  <p className="text-[var(--muted-foreground)] text-sm">
                    {t("code_sent_to")}{" "}
                    <span className="font-semibold text-[var(--foreground)]">{form.email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-3 text-center">
                      {t("verification_code")}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                      placeholder="000000"
                      className="input-field w-full text-center text-2xl font-mono tracking-[0.5em] py-4"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2 rounded-xl text-center">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading
                      ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("verifying")}</>
                      : <><RiCheckLine className="w-4 h-4" /> {t("verify_continue")}</>
                    }
                  </button>

                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={loading || resendCooldown > 0}
                    className="w-full text-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `${t("resend_in")} ${resendCooldown}s`
                      : <>{t("didnt_receive")} <span className="underline font-medium">{t("resend")}</span></>
                    }
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep("form"); setCode(""); setError(""); }}
                    className="w-full text-center text-xs text-[var(--muted-foreground)]/50 hover:text-[var(--muted-foreground)] transition-colors"
                  >
                    {t("wrong_email")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
