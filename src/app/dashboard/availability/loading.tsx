export default function AvailabilityLoading() {
  return (
    <div className="animate-pulse space-y-5 p-1">
      <div className="h-8 w-36 bg-[#1F2A2A]/10 rounded-xl" />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="h-14 bg-white border border-[#1F2A2A]/8 rounded-xl" />
          <div className="bg-white border border-[#1F2A2A]/8 rounded-xl p-5 h-96" />
        </div>
        <div className="space-y-4">
          <div className="bg-white border border-[#1F2A2A]/8 rounded-xl p-5 h-40" />
          <div className="bg-white border border-[#1F2A2A]/8 rounded-xl p-5 h-40" />
        </div>
      </div>
    </div>
  );
}
