import { SignUp } from "@clerk/nextjs";
import { AuthHeader } from "@/components/auth/AuthHeader";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      <AuthHeader />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-[var(--muted-foreground)]">Start booking premium experiences in Cameroon</p>
        </div>
        <SignUp fallbackRedirectUrl="/" />
        <p className="text-sm text-[var(--muted-foreground)]">
          Registering a business?{" "}
          <Link href="/business/sign-up" className="text-[var(--primary)] hover:underline font-medium">
            Sign up here
          </Link>
        </p>
      </div>
    </main>
  );
}
