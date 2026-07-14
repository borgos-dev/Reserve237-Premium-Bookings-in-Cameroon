export default function ReservationsLoading() {
  return (
    <div className="animate-pulse space-y-4 p-1">
      <div className="h-8 w-40 bg-[#1F2A2A]/10 rounded-xl" />
      <div className="h-4 w-64 bg-[#1F2A2A]/8 rounded-xl" />
      <div className="h-12 w-full bg-white border border-[#1F2A2A]/8 rounded-xl mt-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#1F2A2A]/8 rounded-xl p-5 space-y-3">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <div className="w-11 h-11 bg-[#1F2A2A]/10 rounded-xl" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-[#1F2A2A]/10 rounded" />
                <div className="h-3 w-24 bg-[#1F2A2A]/8 rounded" />
              </div>
            </div>
            <div className="h-6 w-20 bg-[#1F2A2A]/10 rounded-full" />
          </div>
          <div className="h-px bg-[#1F2A2A]/8" />
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-[#1F2A2A]/10 rounded" />
            <div className="h-4 w-28 bg-[#1F2A2A]/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
