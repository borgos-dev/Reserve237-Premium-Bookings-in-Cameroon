"use client";

import { Suspense, useState } from "react";
import { useSignIn, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  RiMailLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiShieldCheckLine,
  RiLoader4Line,
} from "react-icons/ri";

type Step = "email" | "code";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const { t } = useLanguage();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const params = useSearchParams();
  const isBusiness = params.get("type") === "business";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setError("");
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (signIn as any).create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("code");
    } catch (err: unknown) {
      const e = err as { errors?: { message: string }[]; message?: string };
      setError(e.errors?.[0]?.message ?? e.message ?? t("fp_err_send"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;

    if (newPassword !== confirmPassword) {
      setError(t("pw_mismatch"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("pw_too_short"));
      return;
    }

    setError("");
    setLoading(true);
    try {
      // Clerk v7: resetPassword replaces attemptFirstFactor for password reset flow
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (signIn as any).resetPassword({
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setSuccess(true);
        setTimeout(() => router.push(isBusiness ? "/dashboard" : "/"), 1500);
      } else {
        setError(t("fp_err_generic"));
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message: string }[]; message?: string };
      setError(e.errors?.[0]?.message ?? e.message ?? t("fp_err_invalid_code"));
    } finally {
      setLoading(false);
    }
  }

  const backHref = isBusiness ? "/business/sign-in" : "/sign-in";

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Back link */}
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8"
          >
            <RiArrowLeftLine className="w-4 h-4" />
            {t("fp_back_to_signin")}
          </Link>

          {/* Success state */}
          {success ? (
            <div className="card text-center py-10">
              <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiShieldCheckLine className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <h2 className="text-xl font-bold mb-2">{t("fp_reset_success")}</h2>
              <p className="text-[var(--muted-foreground)] text-sm">
                {isBusiness ? t("fp_redirecting_dashboard") : t("fp_redirecting_home")}
              </p>
            </div>
          ) : step === "email" ? (
            /* ── Step 1: Enter email ── */
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">{t("forgot_password")}</h1>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {t("fp_subtitle")}
                </p>
              </div>

              <form onSubmit={handleRequestCode} className="card space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("email_address")}</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type="email"
                      required
                      placeholder={t("contact_email_ph")}
                      className="input-field pl-10 w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("fp_sending")}</>
                  ) : (
                    <>{t("fp_send_code")} <RiArrowRightLine className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── Step 2: Code + new password ── */
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">{t("check_email")}</h1>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {t("code_sent_to")}{" "}
                  <span className="font-medium text-[var(--foreground)]">{email}</span>.{" "}
                  {t("fp_enter_below")}
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="card space-y-5">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("fp_reset_code")}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="000000"
                    className="input-field w-full text-center tracking-[0.4em] text-lg font-mono"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>

                {/* New password */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("fp_new_password")}</label>
                  <div className="relative">
                    <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder={t("at_least_8_chars")}
                      className="input-field pl-10 pr-10 w-full"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t("fp_confirm_new")}</label>
                  <div className="relative">
                    <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder={t("repeat_password")}
                      className="input-field pl-10 w-full"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 6 || !newPassword || !confirmPassword}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><RiLoader4Line className="w-4 h-4 animate-spin" /> {t("fp_resetting")}</>
                  ) : (
                    <>{t("fp_reset_btn")} <RiArrowRightLine className="w-4 h-4" /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); setCode(""); }}
                  className="w-full text-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {t("fp_try_again")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
