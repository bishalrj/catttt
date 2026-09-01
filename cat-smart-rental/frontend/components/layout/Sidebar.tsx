"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, LineChart, Bell, History } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/equipment", label: "Equipment", icon: Truck },
  { href: "/rentals", label: "Rental History", icon: History },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-graphite-900 text-slate-300 h-screen border-r border-graphite-700">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
          <Truck className="h-6 w-6 text-industrial-yellow" />
          CAT RENTAL
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md border-l-2 transition-colors ${
                isActive
                  ? "bg-graphite-800 border-industrial-yellow text-industrial-yellow"
                  : "border-transparent hover:bg-graphite-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-graphite-700 text-xs text-slate-500 text-center">
        &copy; 2026 CAT Rental Tracking
      </div>
    </div>
  );
}
