import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="relative mx-auto flex min-h-32 w-full max-w-7xl flex-col items-center justify-center gap-1 px-4 py-3 sm:h-28 sm:min-h-0 sm:flex-row sm:px-6 sm:py-0 lg:px-8">
      <Link href="/" className="flex items-center sm:absolute sm:left-6 lg:left-8">
        <img
          src="/Reserve237-logo.png"
          alt="Reserve237"
          className="h-20 w-auto max-w-[150px] object-contain drop-shadow-[0_2px_8px_rgba(31,42,42,0.3)] sm:h-24 sm:max-w-[190px] md:h-28 md:max-w-[220px]"
          draggable={false}
        />
      </Link>

      <nav className="flex items-center justify-center gap-6 sm:gap-8">
        <Link
          href="/"
          className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          Home
        </Link>
        <Link
          href="/business"
          className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          For Business
        </Link>
      </nav>
    </header>
  );
}
