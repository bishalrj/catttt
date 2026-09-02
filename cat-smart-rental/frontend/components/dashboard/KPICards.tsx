"use client";

import { DashboardSummary } from "@/lib/types";
import { Activity, CheckCircle2, Clock, Gauge, Truck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface KPICardsProps {
  summary: DashboardSummary;
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof target !== "number" || isNaN(target)) return;
    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

interface CardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  badge?: string;
  accent?: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  progress?: number;
  delay?: number;
  glowColor?: string;
  isPercent?: boolean;
}

function Card({
  title,
  value,
  icon,
  badge,
  accent = "text-white",
  trend,
  trendLabel,
  progress,
  delay = 0,
  glowColor = "rgba(255,205,17,0.1)",
  isPercent = false,
}: CardProps) {
  const numericTarget = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  const counted = useCountUp(numericTarget, 1000 + delay);
  const displayVal = isPercent ? `${counted}%` : counted;

  return (
    <div
      className="cat-stat-card cat-page-enter"
      style={{
        animationDelay: `${delay}ms`,
        "--glow": glowColor,
      } as React.CSSProperties}
    >
      {/* Icon + Label */}
      <div className="flex items-center justify-between mb-3">
        <span className="cat-stat-label">{title}</span>
        <div
          className="p-2 rounded-lg border border-[#21293a]"
          style={{ background: "rgba(13,17,23,0.8)" }}
        >
          {icon}
        </div>
      </div>

      {/* Animated Value */}
      <div className="flex items-baseline justify-between">
        <span className={`cat-stat-value cat-counter ${accent}`}>
          {displayVal}
        </span>
        {badge && (
          <span className="text-[9px] font-extrabold tracking-wider text-[#5a6a7e] bg-[#0d1117] px-2 py-0.5 rounded-md border border-[#21293a]">
            {badge}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="mt-3 h-1 bg-[#21293a] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: `linear-gradient(90deg, ${accent?.replace("text-[", "").replace("]", "") || "#ffcd11"}, #e5b700)`,
              transitionDelay: `${delay + 300}ms`,
            }}
          />
        </div>
      )}

      {/* Trend indicator */}
      {trend && trendLabel && (
        <div className="flex items-center gap-1 mt-2">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-400" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
          {trend === "flat" && <Minus className="w-3 h-3 text-[#5a6a7e]" />}
          <span
            className={`text-[10px] font-semibold ${
              trend === "up" ? "text-emerald-400" :
              trend === "down" ? "text-red-400" :
              "text-[#5a6a7e]"
            }`}
          >
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export function KPICards({ summary }: KPICardsProps) {
  const totalPct = summary.total_equipment > 0
    ? Math.round((summary.active_equipment / summary.total_equipment) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card
        title="Total Cat Fleet"
        value={summary.total_equipment}
        icon={<Truck className="h-4 w-4 text-[#ffcd11]" />}
        badge="ASSETS"
        accent="text-white"
        trend="up"
        trendLabel="+2 this month"
        progress={100}
        delay={0}
        glowColor="rgba(255,205,17,0.08)"
      />
      <Card
        title="Active On-Site"
        value={summary.active_equipment}
        icon={<Activity className="h-4 w-4 text-[#38bdf8]" />}
        badge="OPERATIONAL"
        accent="text-[#38bdf8]"
        trend="up"
        trendLabel="Fleet active"
        progress={totalPct}
        delay={80}
        glowColor="rgba(56,189,248,0.08)"
      />
      <Card
        title="Available"
        value={summary.available_equipment}
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        badge="READY"
        accent="text-emerald-400"
        trend="flat"
        trendLabel="Stable"
        progress={summary.total_equipment > 0 ? (summary.available_equipment / summary.total_equipment) * 100 : 0}
        delay={160}
        glowColor="rgba(52,211,153,0.08)"
      />
      <Card
        title="Overdue"
        value={summary.overdue_equipment}
        icon={<Clock className="h-4 w-4 text-red-400" />}
        badge="ATTN REQ"
        accent={summary.overdue_equipment > 0 ? "text-red-400" : "text-[#5a6a7e]"}
        trend={summary.overdue_equipment > 0 ? "down" : "flat"}
        trendLabel={summary.overdue_equipment > 0 ? "Needs recall" : "All clear"}
        delay={240}
        glowColor="rgba(239,68,68,0.06)"
      />
      <Card
        title="Avg Utilisation"
        value={summary.average_utilization}
        icon={<Gauge className="h-4 w-4 text-[#ffcd11]" />}
        badge="RUNTIME"
        accent="text-[#ffcd11]"
        trend={summary.average_utilization > 70 ? "up" : "down"}
        trendLabel={`${summary.average_utilization > 70 ? "Above" : "Below"} target`}
        progress={summary.average_utilization}
        delay={320}
        isPercent
        glowColor="rgba(255,205,17,0.08)"
      />
    </div>
  );
}
