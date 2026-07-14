// Listing detail loading skeleton
export default function ListingLoading() {
  return (
    <div className="bg-[var(--background)] min-h-screen pt-28 pb-24 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Photo mosaic */}
        <div className="grid grid-cols-3 gap-2 h-[420px] mb-10">
          <div className="col-span-2 bg-[var(--border)] rounded-3xl" />
          <div className="space-y-2">
            <div className="h-[calc(50%-4px)] bg-[var(--border)] rounded-3xl" />
            <div className="h-[calc(50%-4px)] bg-[var(--border)] rounded-3xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-6 w-24 bg-[var(--border)] rounded-full" />
            <div className="h-10 w-3/4 bg-[var(--border)] rounded-xl" />
            <div className="h-4 w-full bg-[var(--border)] rounded-xl" />
            <div className="h-4 w-5/6 bg-[var(--border)] rounded-xl" />
            <div className="h-4 w-2/3 bg-[var(--border)] rounded-xl" />
            <div className="h-40 bg-[var(--border)] rounded-2xl" />
          </div>

          {/* Right sticky card */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 space-y-4">
              <div className="h-6 w-32 bg-[var(--border)] rounded" />
              <div className="h-px bg-[var(--border)]" />
              <div className="h-12 bg-[var(--border)] rounded-2xl" />
              <div className="h-12 bg-[var(--border)] rounded-2xl" />
              <div className="h-12 bg-[#25D366]/20 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
