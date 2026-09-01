import { Bell, Search, Activity, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-[#262d38] bg-[#0f1216] flex items-center px-6 justify-between shrink-0 sticky top-0 z-20 shadow-md">
      {/* Search Bar — Cat VisionLink Telematics Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <div className="flex items-center gap-2 bg-[#151a21] border border-[#262d38] rounded px-3 py-1.5 flex-1 focus-within:border-[#ffcd11] focus-within:bg-[#181d24] transition-all">
          <Search className="h-4 w-4 text-[#64748b] shrink-0" />
          <input
            type="text"
            placeholder="Search assets, VisionLink telemetry codes, job sites…"
            className="bg-transparent text-xs text-[#f8fafc] placeholder-[#64748b] outline-none flex-1 font-medium"
          />
        </div>
      </div>

      {/* Right Telemetry Indicators */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#151a21] border border-[#262d38] text-[11px] font-mono text-[#94a3b8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ffcd11]" />
          <span>VISIONLINK TELEMATICS V2.4</span>
        </div>

        {/* Notifications */}
        <button className="relative h-8 w-8 rounded bg-[#151a21] border border-[#262d38] hover:border-[#ffcd11] flex items-center justify-center transition-colors group">
          <Bell className="h-4 w-4 text-[#94a3b8] group-hover:text-[#ffcd11]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffcd11] rounded-full" />
        </button>

        {/* Operator Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#262d38]">
          <div className="h-8 w-8 rounded bg-[#ffcd11] flex items-center justify-center text-[#0b0d10] font-black text-xs shadow-sm">
            CAT
          </div>
        </div>
      </div>
    </header>
  );
}
