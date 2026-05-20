"use client";

import { useState, useEffect } from "react";
import { useSignUp, useClerk } from "@clerk/nextjs";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RiBuilding2Line, RiMapPinLine,
  RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine,
  RiArrowRightLine, RiArrowLeftLine, RiCheckLine,
} from "react-icons/ri";
import { categoryLabels } from "@/lib/categoryColors";

const categories = Object.entries(categoryLabels);

type Step = "business" | "account" | "verify";

export default function BusinessSignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();

  const [step, setStep] = useState<Step>("business");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  // Fallback: if the signal updates with a createdSessionId after our handler runs,
  // pick it up here and complete the sign-in.
  useEffect(() => {
    if (step !== "verify" || !signUp?.createdSessionId) return;
    setActive({ session: signUp.createdSessionId })
      .then(() => router.push("/dashboard"))
      .catch((err: any) => {
        setError(err?.message ?? "Could not complete sign-up.");
        setLoading(false);
      });
  }, [signUp?.createdSessionId]);

  const [business, setBusiness] = useState({
    name: "",
    category: "",
    city: "",
    description: "",
  });

  const [account, setAccount] = useState({
    email: "",
    password: "",
  });

  function handleBusinessNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!business.name || !business.category || !business.city) {
      setError("Please fill in all required fields.");
      return;
    }
    setStep("account");
  }

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp) {
      setError("Authentication service is not ready. Please refresh and try again.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { error: createError } = await signUp.create({
        emailAddress: account.email,
        password: account.password,
        unsafeMetadata: {
          role: "partner",
          businessName: business.name,
          category: business.category,
          city: business.city,
          description: business.description,
        },
      });
      if (createError) {
        setError(createError.message ?? "Something went wrong. Please try again.");
        return;
      }
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(sendError.message ?? "Could not send verification email.");
        return;
      }
      setStep("verify");
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp) {
      setError("Authentication service is not ready. Please refresh and try again.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      console.log("[verify] BEFORE verifyEmailCode:", { status: signUp.status, sessionId: signUp.createdSessionId, missingFields: signUp.missingFields });

      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code: verifyCode });

      console.log("[verify] AFTER verifyEmailCode:", { status: signUp.status, sessionId: signUp.createdSessionId, missingFields: signUp.missingFields, error: verifyError });

      if (verifyError) {
        setError(verifyError.message ?? "Invalid code. Please try again.");
        setLoading(false);
        return;
      }

      // Path A: if verification already created a session, activate it directly
      if (signUp.createdSessionId) {
        console.log("[verify] Path A: createdSessionId present, calling setActive");
        await setActive({ session: signUp.createdSessionId });
        router.push("/dashboard");
        return;
      }

      // Path B: status complete but no session yet → finalize creates the session
      console.log("[verify] Path B: calling finalize()");
      const { error: finalError } = await signUp.finalize();
      console.log("[verify] AFTER finalize:", { status: signUp.status, sessionId: signUp.createdSessionId, error: finalError });

      if (finalError) {
        setError(`${finalError.message ?? "Could not complete sign-up."} (status: ${signUp.status}, missing: ${JSON.stringify(signUp.missingFields)})`);
        setLoading(false);
        return;
      }

      if (signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
        router.push("/dashboard");
      } else {
        setError(`Sign-up not yet complete. Status: ${signUp.status}. Missing: ${JSON.stringify(signUp.missingFields)}`);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("[verify] Exception:", err);
      setError(err.errors?.[0]?.message ?? err.message ?? "Invalid code. Please try again.");
      setLoading(false);
    }
  }

  const steps: Step[] = ["business", "account", "verify"];
  const stepLabels = ["Business Info", "Your Account", "Verify Email"];

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  steps.indexOf(step) > i
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : step === s
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                }`}>
                  {steps.indexOf(step) > i ? <RiCheckLine className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:inline ${step === s ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                  {stepLabels[i]}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-px mx-1 ${steps.indexOf(step) > i ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: Business Info ── */}
          {step === "business" && (
            <form onSubmit={handleBusinessNext} className="card space-y-5">
              <div className="mb-2">
                <h1 className="text-2xl font-bold mb-1">Tell us about your business</h1>
                <p className="text-[var(--muted-foreground)] text-sm">This information will appear on your listing</p>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Business Name <span className="text-[var(--destructive)]">*</span></label>
                <div className="relative">
                  <RiBuilding2Line className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sky Lounge Bastos"
                    className="input-field pl-10 w-full"
                    value={business.name}
                    onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Business Category <span className="text-[var(--destructive)]">*</span></label>
                <select
                  required
                  className="input-field w-full appearance-none"
                  value={business.category}
                  onChange={(e) => setBusiness({ ...business, category: e.target.value })}
                >
                  <option value="" style={{ color: "#1F2A2A", backgroundColor: "#F8F1EA" }}>Select a category</option>
                  {categories.map(([value, label]) => (
                    <option key={value} value={value} style={{ color: "#1F2A2A", backgroundColor: "#F8F1EA" }}>{label}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium mb-1.5">City / Location <span className="text-[var(--destructive)]">*</span></label>
                <div className="relative">
                  <RiMapPinLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <select
                    required
                    className="input-field pl-10 w-full appearance-none"
                    value={business.city}
                    onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                  >
                    <option value="" style={{ color: "#1F2A2A", backgroundColor: "#F8F1EA" }}>Select your city</option>
                    {["Yaounde", "Douala", "Limbe", "Bafoussam", "Bamenda"].map((c) => (
                      <option key={c} value={c} style={{ color: "#1F2A2A", backgroundColor: "#F8F1EA" }}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>


              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Short Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your business in a few sentences…"
                  className="input-field w-full resize-none"
                  value={business.description}
                  onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2 rounded-xl">{error}</p>
              )}

              <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                Continue <RiArrowRightLine className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ── Step 2: Account Credentials ── */}
          {step === "account" && (
            <form onSubmit={handleAccountSubmit} className="card space-y-5">
              <div className="mb-2">
                <h1 className="text-2xl font-bold mb-1">Create your account</h1>
                <p className="text-[var(--muted-foreground)] text-sm">These are your login credentials</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <div className="relative">
                  <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="email"
                    required
                    placeholder="your@business.com"
                    className="input-field pl-10 w-full"
                    value={account.email}
                    onChange={(e) => setAccount({ ...account, email: e.target.value })}
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
                    placeholder="Min. 8 characters"
                    className="input-field pl-10 pr-10 w-full"
                    value={account.password}
                    onChange={(e) => setAccount({ ...account, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div id="clerk-captcha" />

              {error && (
                <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2 rounded-xl">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("business")}
                  className="btn-secondary flex-none flex items-center gap-2 px-5"
                >
                  <RiArrowLeftLine className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading || fetchStatus === "fetching" || !signUp}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Creating account…" : (<>Create Account <RiArrowRightLine className="w-4 h-4" /></>)}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Email Verification ── */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="card space-y-5 text-center">
              <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto">
                <RiMailLine className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Check your email</h1>
                <p className="text-[var(--muted-foreground)] text-sm">
                  We sent a 6-digit code to <strong>{account.email}</strong>
                </p>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit code"
                className="input-field w-full text-center text-2xl tracking-widest font-bold"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
              />
              {error && (
                <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2 rounded-xl">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || verifyCode.length < 6}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Verifying…" : (<>Verify & Go to Dashboard <RiArrowRightLine className="w-4 h-4" /></>)}
              </button>
            </form>
          )}

          <p className="text-sm text-[var(--muted-foreground)] mt-8 text-center">
            Already a partner? {" "}
            <Link href="/business/sign-in" className="text-[var(--primary)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
