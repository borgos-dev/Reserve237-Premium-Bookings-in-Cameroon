export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20 animate-pulse">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 mb-8">
        <div className="flex gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[var(--border)]" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-36 bg-[var(--border)] rounded-lg" />
            <div className="h-4 w-48 bg-[var(--border)] rounded-lg" />
            <div className="h-4 w-24 bg-[var(--border)] rounded-lg" />
          </div>
        </div>
      </div>
      <div className="h-7 w-36 bg-[var(--border)] rounded-xl mb-5" />
      <div className="h-12 w-40 bg-[var(--border)] rounded-xl mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
            <div className="h-5 w-1/2 bg-[var(--border)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--border)] rounded" />
            <div className="h-px bg-[var(--border)]" />
            <div className="flex justify-between">
              <div className="h-5 w-20 bg-[var(--border)] rounded" />
              <div className="h-5 w-24 bg-[var(--border)] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
