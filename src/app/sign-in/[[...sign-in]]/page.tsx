"use client";

import { useState, useEffect } from "react";
import { useSignIn, useClerk } from "@clerk/nextjs";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiArrowRightLine } from "react-icons/ri";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!signIn?.createdSessionId) return;
    setActive({ session: signIn.createdSessionId })
      .then(() => router.push("/"))
      .catch(() => {
        setError(t("err_signin_failed"));
        setLoading(false);
      });
  }, [signIn?.createdSessionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) {
      setError(t("err_auth_not_ready"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await signIn.create({ identifier: email, password });
      if (signInError) {
        setError(t("err_invalid_credentials"));
        setLoading(false);
      }
    } catch {
      setError(t("err_invalid_credentials"));
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">{t("welcome_back")}</h1>
            <p className="text-[var(--muted-foreground)]">
              {t("sign_in_subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="input-field pl-10 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">{t("password")}</label>
                <Link href="/forgot-password" className="text-xs text-[var(--primary)] hover:underline">
                  {t("forgot_password")}
                </Link>
              </div>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10 w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  aria-label={showPassword ? t("hide_password") : t("show_password")}
                >
                  {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || fetchStatus === "fetching" || !signIn}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? t("signing_in") : (
                <>{t("sign_in")} <RiArrowRightLine className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
            {t("no_account")}{" "}
            <Link href="/sign-up" className="text-[var(--primary)] hover:underline font-medium">
              {t("create_one")}
            </Link>
          </p>
          <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
            {t("are_you_business")}{" "}
            <Link href="/business/sign-in" className="text-[var(--primary)] hover:underline font-medium">
              {t("sign_in_here")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
