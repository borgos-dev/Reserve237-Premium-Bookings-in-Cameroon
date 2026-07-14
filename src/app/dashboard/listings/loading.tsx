export default function ListingsLoading() {
  return (
    <div className="animate-pulse space-y-6 p-1">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-8 w-36 bg-[#1F2A2A]/10 rounded-xl" />
          <div className="h-4 w-52 bg-[#1F2A2A]/8 rounded-xl" />
        </div>
        <div className="h-10 w-32 bg-[#13695A]/20 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="h-40 bg-[var(--border)]" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-16 bg-[var(--border)] rounded-full" />
              <div className="h-5 w-3/4 bg-[var(--border)] rounded" />
              <div className="h-4 w-1/2 bg-[var(--border)] rounded" />
              <div className="h-px bg-[var(--border)]" />
              <div className="flex justify-between">
                <div className="h-7 w-20 bg-[var(--border)] rounded-lg" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-[var(--border)] rounded-lg" />
                  <div className="w-8 h-8 bg-[var(--border)] rounded-lg" />
                  <div className="w-8 h-8 bg-[var(--border)] rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
