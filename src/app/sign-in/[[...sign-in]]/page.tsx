import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center">
          <img src="/Reserve237-logo.png" alt="Reserve237" className="h-20 sm:h-24 w-auto max-w-[190px] object-contain" />
        </Link>
        <p className="text-sm text-[var(--muted-foreground)]">
          No account?{" "}
          <Link href="/sign-up" className="text-[var(--primary)] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-[var(--muted-foreground)]">Sign in to your Reserve237 account</p>
        </div>
        <SignIn fallbackRedirectUrl="/" />
        <p className="text-sm text-[var(--muted-foreground)]">
          Are you a business?{" "}
          <Link href="/business/sign-in" className="text-[var(--primary)] hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
}
