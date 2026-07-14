export default function SettingsLoading() {
  return (
    <div className="animate-pulse space-y-6 p-1">
      <div className="h-8 w-28 bg-[#1F2A2A]/10 rounded-xl" />
      <div className="h-12 bg-white border border-[#1F2A2A]/8 rounded-xl w-full" />
      <div className="bg-white border border-[#1F2A2A]/8 rounded-xl p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 bg-[#1F2A2A]/10 rounded" />
            <div className="h-10 bg-[#1F2A2A]/8 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
