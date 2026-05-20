import { SignIn } from "@clerk/nextjs";
import { AuthHeader } from "@/components/auth/AuthHeader";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      <AuthHeader />

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
