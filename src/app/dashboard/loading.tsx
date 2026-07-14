// Dashboard loading skeleton â€” shown while stats fetch from DB
export default function DashboardLoading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#1F2A2A]/8 rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-[#1F2A2A]/10 rounded" />
              <div className="w-9 h-9 bg-[#1F2A2A]/10 rounded-xl" />
            </div>
            <div className="h-7 w-16 bg-[#1F2A2A]/10 rounded" />
            <div className="h-3 w-32 bg-[#1F2A2A]/10 rounded" />
          </div>
        ))}
      </div>

      {/* Chart + bookings */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-5">
          <div className="bg-white border border-[#1F2A2A]/8 rounded-xl p-6 h-40" />
          <div className="bg-white border border-[#1F2A2A]/8 rounded-xl p-6 h-64" />
        </div>
        <div className="space-y-5">
          <div className="bg-white border border-[#1F2A2A]/8 rounded-xl p-5 h-48" />
          <div className="bg-white border border-[#1F2A2A]/8 rounded-xl p-5 h-40" />
        </div>
      </div>
    </div>
  );
}
