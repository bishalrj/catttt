"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, LineChart, Bell, History, Bot, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/equipment", label: "Equipment", icon: Truck },
  { href: "/rentals", label: "Rental History", icon: History },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

const AI_NAV_ITEMS = [
  { href: "/chat", label: "FleetAI Chat", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white text-rm-text-secondary h-screen border-r border-rm-border shadow-sm shrink-0">
      {/* Logo — RentoMojo style: red box + brand name */}
      <div className="px-5 py-5 border-b border-rm-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-rm-red flex items-center justify-center shrink-0 shadow-sm group-hover:bg-rm-red-hover transition-colors">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-800 text-rm-text-primary leading-tight tracking-tight" style={{ fontWeight: 800 }}>
              CAT Rental
            </p>
            <p className="text-[10px] text-rm-text-muted leading-none tracking-wide">Fleet Management</p>
          </div>
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-rm-text-muted font-700 mb-1">
          Main Menu
        </p>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href) && !pathname.includes("/lifecycle");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-2 transition-all text-sm font-medium group ${
                isActive
                  ? "bg-rm-red-light border-rm-red text-rm-red"
                  : "border-transparent text-rm-text-secondary hover:bg-rm-surface hover:text-rm-text-primary"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-rm-red" : "text-rm-text-muted group-hover:text-rm-text-primary"}`} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="h-3 w-3 text-rm-red" />}
            </Link>
          );
        })}

        {/* AI section */}
        <div className="pt-4 mt-3 border-t border-rm-border">
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-rm-text-muted font-700 mb-1">
            AI Intelligence
          </p>
          {AI_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-2 transition-all text-sm font-medium group ${
                  isActive
                    ? "bg-rm-purple-light border-rm-purple text-rm-purple"
                    : "border-transparent text-rm-text-secondary hover:bg-rm-purple-light hover:text-rm-purple"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-rm-purple" : "text-rm-text-muted group-hover:text-rm-purple"}`} />
                <span className="flex-1">{label}</span>
                <span className="text-[9px] font-bold text-rm-purple bg-rm-purple-light border border-purple-200 px-1.5 py-0.5 rounded-full">
                  GEMINI
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-rm-border">
        <p className="text-[10px] text-rm-text-muted text-center">
          &copy; 2026 CAT Rental Tracking
        </p>
      </div>
    </div>
  );
}
