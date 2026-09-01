"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, LineChart, Bell, History, Bot, ChevronRight, Map, Activity, Wrench } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "GIS Fleet Map", icon: Map },
  { href: "/equipment", label: "Fleet Telematics", icon: Truck },
  { href: "/rentals", label: "Rental Operations", icon: History },
  { href: "/analytics", label: "Demand Analytics", icon: LineChart },
  { href: "/alerts", label: "VisionLink Alerts", icon: Bell },
];

const AI_NAV_ITEMS = [
  { href: "/chat", label: "Cat FleetAI Advisor", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-[#0b0d10] text-[#94a3b8] h-screen border-r border-[#262d38] shrink-0 select-none">
      {/* Brand Header — Caterpillar VisionLink */}
      <div className="px-5 py-4 border-b border-[#262d38] bg-[#0f1216]">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Iconic Cat Yellow Triangle Badge */}
          <div className="relative w-9 h-9 bg-black border border-[#323b49] rounded flex items-center justify-center font-black text-white tracking-tighter text-sm shadow-md group-hover:border-[#ffcd11] transition-colors">
            <span className="text-white text-xs font-black">CAT</span>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#ffcd11]" />
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-1.5">
              VisionLink
              <span className="text-[10px] text-[#ffcd11] font-mono">2.0</span>
            </p>
            <p className="text-[10px] text-[#64748b] uppercase tracking-widest font-semibold">
              Fleet Telematics
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-[#64748b] font-bold mb-1">
          Operations
        </p>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href) && !pathname.includes("/lifecycle");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-2 group ${
                isActive
                  ? "bg-[#ffcd11]/10 border-[#ffcd11] text-[#ffcd11]"
                  : "border-transparent text-[#94a3b8] hover:bg-[#151a21] hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#ffcd11]" : "text-[#64748b] group-hover:text-white"}`} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="h-3 w-3 text-[#ffcd11]" />}
            </Link>
          );
        })}

        {/* AI & Telemetry Intelligence */}
        <div className="pt-4 mt-3 border-t border-[#262d38]">
          <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-[#64748b] font-bold mb-1">
            Cat Intelligence
          </p>
          {AI_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-2 group ${
                  isActive
                    ? "bg-[#ffcd11]/15 border-[#ffcd11] text-[#ffcd11]"
                    : "border-transparent text-[#94a3b8] hover:bg-[#151a21] hover:text-[#ffcd11]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#ffcd11]" : "text-[#64748b] group-hover:text-[#ffcd11]"}`} />
                <span className="flex-1">{label}</span>
                <span className="text-[9px] font-extrabold text-[#0b0d10] bg-[#ffcd11] px-1.5 py-0.5 rounded-xs tracking-tight">
                  AI
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Cat VisionLink Telematics Status Footer */}
      <div className="px-4 py-3 border-t border-[#262d38] bg-[#0f1216] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#64748b] font-mono text-[10px]">FEED: ONLINE</span>
        </div>
        <span className="text-[#64748b] font-mono text-[10px]">&copy; CATERPILLAR</span>
      </div>
    </div>
  );
}
