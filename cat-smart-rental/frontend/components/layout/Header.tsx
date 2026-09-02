"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Search, ShieldCheck, Command, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/ui/CommandPalette";

const BREADCRUMB_MAP: Record<string, string> = {
  "/":          "Dashboard",
  "/map":       "GIS Fleet Map",
  "/equipment": "Fleet Telematics",
  "/rentals":   "Rental Operations",
  "/analytics": "Demand Analytics",
  "/alerts":    "VisionLink Alerts",
  "/chat":      "Cat FleetAI Advisor",
};

const MARQUEE_ITEMS = [
  "⬛ ENGINE HOURS: 847.3h TODAY",
  "🟡 FLEET UTILISATION: 78.4%",
  "🟢 ACTIVE ASSETS: 18 / 24",
  "🔴 OVERDUE ALERTS: 3 UNITS",
  "⬛ FUEL CONSUMED: 1,284 L",
  "🟡 AVG IDLE RATIO: 24.1%",
  "🟢 TELEMATICS FEED: LIVE",
  "⬛ GEOFENCES ACTIVE: 4",
];

export function Header() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [bellRing, setBellRing] = useState(false);
  const pathname = usePathname();

  // Build breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [
    { label: "VisionLink", href: "/" },
  ];
  let accum = "";
  segments.forEach((seg) => {
    accum += `/${seg}`;
    const label = BREADCRUMB_MAP[accum] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    breadcrumbs.push({ label, href: accum });
  });

  // Ctrl+K / Cmd+K handler
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setPaletteOpen((o) => !o);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  // Periodically ring the bell
  useEffect(() => {
    const id = setInterval(() => {
      setBellRing(true);
      setTimeout(() => setBellRing(false), 800);
    }, 12000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <header className="shrink-0 sticky top-0 z-20 bg-[#080a0d]/95 backdrop-blur-md border-b border-[#21293a] shadow-lg">
        {/* Marquee telemetry strip */}
        <div className="h-7 bg-[#0a0c10] border-b border-[#21293a] overflow-hidden flex items-center">
          <div className="flex items-center gap-1 shrink-0 px-3 border-r border-[#21293a] h-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
            <span className="text-[9px] font-bold font-mono text-[#34d399] uppercase tracking-wider">LIVE</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="cat-marquee-track">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono text-[#5a6a7e] px-6 whitespace-nowrap"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main header row */}
        <div className="h-14 flex items-center px-5 gap-4">
          {/* Search / Command Palette trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2.5 bg-[#161b23] border border-[#21293a] rounded-lg px-3 py-2
              text-xs text-[#5a6a7e] hover:border-[#ffcd11]/40 hover:text-[#8898aa]
              transition-all duration-200 flex-1 max-w-sm group"
            id="header-command-palette-btn"
          >
            <Search className="h-3.5 w-3.5 group-hover:text-[#ffcd11] transition-colors" />
            <span className="flex-1 text-left">Search assets, pages…</span>
            <div className="flex items-center gap-0.5">
              <kbd className="text-[9px] font-mono bg-[#0d1117] border border-[#21293a] px-1 py-0.5 rounded">⌘</kbd>
              <kbd className="text-[9px] font-mono bg-[#0d1117] border border-[#21293a] px-1 py-0.5 rounded">K</kbd>
            </div>
          </button>

          {/* Breadcrumbs — hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-1 text-[11px] text-[#5a6a7e] font-mono">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-[#2d3848]" />}
                <span className={i === breadcrumbs.length - 1 ? "text-[#ffcd11] font-bold" : ""}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            {/* Version badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161b23] border border-[#21293a] text-[10px] font-mono text-[#8898aa]">
              <ShieldCheck className="w-3 h-3 text-[#ffcd11]" />
              <span>VISIONLINK V2.4</span>
            </div>

            {/* Notification Bell */}
            <button
              id="header-notifications-btn"
              className={`relative h-9 w-9 rounded-lg bg-[#161b23] border border-[#21293a]
                hover:border-[#ffcd11]/40 flex items-center justify-center transition-all duration-200 group`}
            >
              <Bell
                className={`h-4 w-4 text-[#8898aa] group-hover:text-[#ffcd11] transition-colors ${bellRing ? "bell-ring" : ""}`}
              />
              {/* Alert badge */}
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center border-2 border-[#080a0d]">
                3
              </span>
            </button>

            {/* Operator avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#21293a]">
              <div className="relative">
                <div
                  className="h-9 w-9 rounded-lg bg-[#ffcd11] flex items-center justify-center text-[#080a0d] font-black text-[11px] cursor-pointer hover:bg-[#e5b700] transition-colors shadow-md"
                  style={{ boxShadow: "0 0 10px rgba(255,205,17,0.2)" }}
                >
                  CAT
                </div>
                {/* Online status ring */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#34d399] rounded-full border-2 border-[#080a0d]" />
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-white leading-none">Fleet Ops</p>
                <p className="text-[10px] text-[#5a6a7e] font-mono">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette Portal */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
