"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  LineChart,
  Bell,
  History,
  Bot,
  ChevronRight,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Cpu,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/",          label: "Dashboard",        icon: LayoutDashboard, color: "#ffcd11" },
  { href: "/map",       label: "GIS Fleet Map",    icon: Map,             color: "#38bdf8" },
  { href: "/equipment", label: "Fleet Telematics", icon: Truck,           color: "#34d399" },
  { href: "/rentals",   label: "Rental Ops",       icon: History,         color: "#a855f7" },
  { href: "/analytics", label: "Analytics",        icon: LineChart,       color: "#ffcd11" },
  { href: "/alerts",    label: "Alerts",            icon: Bell,            color: "#f87171" },
];

const AI_ITEMS = [
  { href: "/chat", label: "Cat FleetAI", icon: Bot, color: "#ffcd11" },
];

const STATUS_CYCLE = [
  { text: "FEED: LIVE",    color: "#34d399" },
  { text: "GPS: ACTIVE",   color: "#38bdf8" },
  { text: "AI: ONLINE",    color: "#ffcd11" },
  { text: "IOT: SYNCED",   color: "#a855f7" },
];

function NavItem({
  href,
  label,
  icon: Icon,
  color,
  isActive,
  collapsed,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  color: string;
  isActive: boolean;
  collapsed: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider
        transition-all duration-200 border-l-2 group overflow-hidden
        ${isActive
          ? "bg-[#ffcd11]/10 border-[#ffcd11] text-[#ffcd11] nav-item-active shadow-sm"
          : "border-transparent text-[#5a6a7e] hover:bg-[#161b23] hover:text-white hover:border-[#21293a]"
        }`}
    >
      {/* Shimmer on hover */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${color}08, transparent)` }} />

      <Icon
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ width: 16, height: 16, color: isActive ? color : "#5a6a7e" }}
      />

      {!collapsed && (
        <>
          <span className="sidebar-label flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="sidebar-badge text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 min-w-[18px] text-center">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
          {isActive && <ChevronRight className="w-3 h-3 text-[#ffcd11] shrink-0" />}
        </>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState("");
  const [statusIdx, setStatusIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Live clock
  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Cycle status messages
  useEffect(() => {
    const id = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS_CYCLE.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const status = STATUS_CYCLE[statusIdx];

  return (
    <div
      className="flex flex-col h-screen bg-[#080a0d] text-[#8898aa] border-r border-[#21293a] shrink-0 select-none transition-all duration-300 ease-in-out relative"
      style={{ width: collapsed ? 64 : 256 }}
    >
      {/* Brand Header */}
      <div className="px-3 py-4 border-b border-[#21293a] bg-[#0a0c10] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-[#ffcd11]/5 blur-xl pointer-events-none" />

        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          {/* CAT Logo Badge */}
          <Link href="/" className="relative shrink-0 group">
            <div className="w-9 h-9 bg-[#ffcd11] rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
              style={{ boxShadow: "0 0 12px rgba(255,205,17,0.3)" }}>
              <span className="text-[#080a0d] font-black text-xs tracking-tighter">CAT</span>
            </div>
          </Link>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-1.5">
                VisionLink
                <span className="text-[10px] text-[#ffcd11] font-mono bg-[#ffcd11]/10 px-1 py-0.5 rounded">
                  2.0
                </span>
              </p>
              <p className="text-[10px] text-[#5a6a7e] uppercase tracking-widest font-semibold truncate">
                Fleet Telematics
              </p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 rounded-md bg-[#161b23] border border-[#21293a]
            flex items-center justify-center text-[#5a6a7e] hover:text-[#ffcd11] hover:border-[#ffcd11]/40
            transition-all duration-200 ${collapsed ? "hidden" : ""}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 w-8 h-8 rounded-lg bg-[#161b23] border border-[#21293a]
            flex items-center justify-center text-[#5a6a7e] hover:text-[#ffcd11] hover:border-[#ffcd11]/40
            transition-all duration-200"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="sidebar-section-title px-3 py-1 text-[10px] uppercase tracking-widest text-[#5a6a7e] font-bold mb-1">
            Operations
          </p>
        )}

        {NAV_ITEMS.map(({ href, label, icon, color }, idx) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <div key={href} style={{ animationDelay: `${idx * 40}ms` }} className="cat-fade-in">
              <NavItem
                href={href}
                label={label}
                icon={icon}
                color={color}
                isActive={isActive}
                collapsed={collapsed}
                badge={href === "/alerts" ? 3 : undefined}
              />
            </div>
          );
        })}

        {/* AI Section */}
        <div className={`pt-3 mt-2 border-t border-[#21293a]`}>
          {!collapsed && (
            <p className="sidebar-section-title px-3 py-1 text-[10px] uppercase tracking-widest text-[#5a6a7e] font-bold mb-1">
              Cat Intelligence
            </p>
          )}
          {AI_ITEMS.map(({ href, label, icon, color }) => {
            const isActive = pathname.startsWith(href);
            return (
              <div key={href} className="relative">
                <NavItem
                  href={href}
                  label={label}
                  icon={icon}
                  color={color}
                  isActive={isActive}
                  collapsed={collapsed}
                />
                {!collapsed && !isActive && (
                  <span className="sidebar-badge absolute top-1/2 -translate-y-1/2 right-3 text-[9px] font-extrabold text-[#080a0d] bg-[#ffcd11] px-1.5 py-0.5 rounded tracking-tight">
                    AI
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* System Status Footer */}
      <div className="border-t border-[#21293a] bg-[#0a0c10] px-3 py-3 space-y-2">
        {/* Live clock */}
        {!collapsed && mounted && (
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <Cpu className="w-3 h-3 text-[#5a6a7e] shrink-0" />
            <span className="text-[#ffcd11] font-bold">{time}</span>
            <span className="text-[#5a6a7e]">IST</span>
          </div>
        )}

        {/* Animated status */}
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <div
            className="w-2 h-2 rounded-full shrink-0 animate-pulse"
            style={{ background: status.color }}
          />
          {!collapsed && (
            <span
              className="sidebar-footer-text text-[10px] font-mono font-bold transition-colors duration-500"
              style={{ color: status.color }}
            >
              {status.text}
            </span>
          )}
        </div>

        {/* Signal bars */}
        {!collapsed && (
          <div className="sidebar-footer-text flex items-center gap-1">
            {[3, 5, 7, 9].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full transition-all"
                style={{
                  height: h,
                  background: i < 3 ? "#ffcd11" : "#21293a",
                  opacity: i < 3 ? 1 : 0.5,
                }}
              />
            ))}
            <span className="text-[9px] font-mono text-[#5a6a7e] ml-1">-72 dBm</span>
            <Zap className="w-3 h-3 text-[#ffcd11] ml-auto animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
