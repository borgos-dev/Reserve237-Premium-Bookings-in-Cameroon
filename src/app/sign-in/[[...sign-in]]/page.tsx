"use client";

import { useState, useEffect } from "react";
import { useSignIn, useClerk } from "@clerk/nextjs";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiArrowRightLine } from "react-icons/ri";

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signIn?.createdSessionId) return;
    setActive({ session: signIn.createdSessionId })
      .then(() => router.push("/"))
      .catch((err: any) => {
        setError(err?.message ?? "Could not complete sign-in.");
        setLoading(false);
      });
  }, [signIn?.createdSessionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) {
      setError("Authentication service is not ready. Please refresh and try again.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await signIn.create({ identifier: email, password });
      if (signInError) {
        setError(signInError.message ?? "Invalid email or password.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? err.message ?? "Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-[var(--muted-foreground)]">
              Sign in to your Reserve237 account
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
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type={showPassword ? "text" : "password"}
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              {loading ? "Signing in…" : (
                <>Sign In <RiArrowRightLine className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
            Don&rsquo;t have an account?{" "}
            <Link href="/sign-up" className="text-[var(--primary)] hover:underline font-medium">
              Create one
            </Link>
          </p>
          <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
            Are you a business?{" "}
            <Link href="/business/sign-in" className="text-[var(--primary)] hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
