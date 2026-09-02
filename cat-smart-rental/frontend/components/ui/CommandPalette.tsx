"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Truck,
  Map,
  History,
  LineChart,
  Bell,
  Bot,
  ArrowRight,
  Hash,
  Command,
} from "lucide-react";

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: React.ReactNode;
  category: string;
  keywords?: string[];
}

const PAGES: PaletteItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Fleet overview & KPI telemetrics",
    href: "/",
    icon: <LayoutDashboard className="w-4 h-4 text-[#ffcd11]" />,
    category: "Navigation",
    keywords: ["home", "overview", "summary", "kpi"],
  },
  {
    id: "map",
    label: "GIS Fleet Map",
    description: "Google Maps live asset tracking",
    href: "/map",
    icon: <Map className="w-4 h-4 text-[#38bdf8]" />,
    category: "Navigation",
    keywords: ["map", "gps", "location", "geofence", "satellite"],
  },
  {
    id: "fleet",
    label: "Fleet Telematics",
    description: "All equipment & telemetry data",
    href: "/equipment",
    icon: <Truck className="w-4 h-4 text-[#34d399]" />,
    category: "Navigation",
    keywords: ["equipment", "fleet", "machines", "assets", "telematics"],
  },
  {
    id: "rentals",
    label: "Rental Operations",
    description: "Active & historical rental contracts",
    href: "/rentals",
    icon: <History className="w-4 h-4 text-[#a855f7]" />,
    category: "Navigation",
    keywords: ["rental", "contract", "history", "operations"],
  },
  {
    id: "analytics",
    label: "Demand Analytics",
    description: "Forecasting & utilisation trends",
    href: "/analytics",
    icon: <LineChart className="w-4 h-4 text-[#ffcd11]" />,
    category: "Navigation",
    keywords: ["analytics", "forecast", "demand", "trends", "utilisation"],
  },
  {
    id: "alerts",
    label: "VisionLink Alerts",
    description: "Overdue & maintenance alerts",
    href: "/alerts",
    icon: <Bell className="w-4 h-4 text-[#f87171]" />,
    category: "Navigation",
    keywords: ["alerts", "overdue", "maintenance", "warnings"],
  },
  {
    id: "ai",
    label: "Cat FleetAI Advisor",
    description: "AI-powered fleet intelligence",
    href: "/chat",
    icon: <Bot className="w-4 h-4 text-[#ffcd11]" />,
    category: "Intelligence",
    keywords: ["ai", "chat", "gemini", "advisor", "intelligence"],
  },
];

function fuzzyMatch(query: string, item: PaletteItem): boolean {
  const q = query.toLowerCase();
  return (
    item.label.toLowerCase().includes(q) ||
    (item.description?.toLowerCase().includes(q) ?? false) ||
    (item.keywords?.some((k) => k.includes(q)) ?? false)
  );
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = query
    ? PAGES.filter((item) => fuzzyMatch(query, item))
    : PAGES;

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
      setQuery("");
      setSelected(0);
    },
    [router, onClose]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter" && results[selected]) {
        navigate(results[selected].href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, selected, navigate, onClose]);

  if (!open) return null;

  // Group by category
  const grouped: Record<string, PaletteItem[]> = {};
  results.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return (
    <div
      className="cat-palette-backdrop flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      <div
        className="cat-palette w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#21293a]">
          <Search className="w-4 h-4 text-[#5a6a7e] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, assets, commands…"
            className="flex-1 bg-transparent text-sm text-[#f8fafc] placeholder-[#5a6a7e] outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#5a6a7e] bg-[#0d1117] border border-[#21293a] px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto max-h-80 py-2">
          {results.length === 0 ? (
            <div className="py-10 text-center text-[#5a6a7e] text-sm">
              <Hash className="w-6 h-6 mx-auto mb-2 text-[#2d3848]" />
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#5a6a7e]">
                  {category}
                </p>
                {items.map((item) => {
                  const globalIdx = results.indexOf(item);
                  const isSelected = globalIdx === selected;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setSelected(globalIdx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "bg-[#ffcd11]/10 text-white"
                          : "text-[#8898aa] hover:text-white hover:bg-[#1d2530]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#ffcd11]/15 border border-[#ffcd11]/30"
                            : "bg-[#0d1117] border border-[#21293a]"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-white" : ""}`}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-[#5a6a7e] truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <ArrowRight className="w-3.5 h-3.5 text-[#ffcd11] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#21293a] text-[10px] font-mono text-[#5a6a7e]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-[#0d1117] border border-[#21293a] px-1 py-0.5 rounded text-[9px]">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-[#0d1117] border border-[#21293a] px-1 py-0.5 rounded text-[9px]">↵</kbd> open
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#ffcd11]/60">
            <Command className="w-3 h-3" />
            <span>Cat VisionLink Navigator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
