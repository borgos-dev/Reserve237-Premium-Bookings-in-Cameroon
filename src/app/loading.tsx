// Homepage loading skeleton — shown instantly while listings fetch from DB
export default function HomeLoading() {
  return (
    <div className="bg-[var(--background)] min-h-screen animate-pulse">
      {/* Navbar placeholder */}
      <div className="h-24 border-b border-[var(--border)]" />

      {/* Hero placeholder */}
      <div className="h-[60vh] bg-[var(--surface-1)]" />

      {/* Cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-8 w-48 bg-[var(--border)] rounded-xl mb-3" />
        <div className="h-4 w-72 bg-[var(--border)] rounded-xl mb-8" />

        {/* Category buttons */}
        <div className="grid grid-cols-4 gap-3 mb-12">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-24 bg-[var(--border)] rounded-3xl" />
          ))}
        </div>

        {/* Listing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/3] bg-[var(--border)] rounded-3xl" />
              <div className="h-5 w-3/4 bg-[var(--border)] rounded-lg" />
              <div className="h-4 w-1/2 bg-[var(--border)] rounded-lg" />
              <div className="h-4 w-1/4 bg-[var(--border)] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
