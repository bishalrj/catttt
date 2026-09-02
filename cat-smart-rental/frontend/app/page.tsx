import { getDashboardSummary, getEquipmentList, getSiteUsageSummary } from "@/lib/api";
import { KPICards } from "@/components/dashboard/KPICards";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  ChevronRight,
  Sparkles,
  Truck,
  Gauge,
  Radio,
  MapPin,
  Zap,
  Activity,
  ExternalLink,
} from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  AVAILABLE:   { label: "AVAILABLE",   className: "cat-badge cat-badge-available cat-badge-pulse" },
  ACTIVE:      { label: "ACTIVE",      className: "cat-badge cat-badge-active cat-badge-pulse" },
  OVERDUE:     { label: "OVERDUE",     className: "cat-badge cat-badge-overdue cat-badge-pulse" },
  MAINTENANCE: { label: "MAINTENANCE", className: "cat-badge cat-badge-maintenance" },
};

const STATUS_BAR_COLOR: Record<string, string> = {
  AVAILABLE:   "#10b981",
  ACTIVE:      "#ffcd11",
  OVERDUE:     "#ef4444",
  MAINTENANCE: "#f59e0b",
};

export default async function DashboardPage() {
  try {
    const summary = await getDashboardSummary();
    const equipment = await getEquipmentList();
    const siteUsage = await getSiteUsageSummary();
    const recent = equipment.slice(0, 6);

    return (
      <div className="max-w-[1400px] mx-auto space-y-8 cat-page-enter">

        {/* ── Hero Command Banner ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-xl border border-[#21293a] shadow-2xl">
          {/* Background gradient mesh orbs */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#131820] to-[#0d1117]" />
          <div
            className="cat-hero-mesh"
            style={{
              width: 300,
              height: 300,
              top: -80,
              right: -60,
              background: "radial-gradient(circle, rgba(255,205,17,0.12) 0%, transparent 70%)",
              animationDelay: "0s",
            }}
          />
          <div
            className="cat-hero-mesh"
            style={{
              width: 200,
              height: 200,
              bottom: -60,
              left: "30%",
              background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
              animationDelay: "3s",
            }}
          />

          {/* Yellow left accent bar */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#ffcd11] to-[#e5b700]" />

          <div className="relative z-10 p-7 sm:p-9 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-[#ffcd11]/15 border border-[#ffcd11]/25 px-3 py-1 rounded-lg text-[10px] font-black text-[#ffcd11] tracking-widest uppercase">
                <Radio className="w-3 h-3 animate-pulse" />
                Cat® VisionLink® Unified Fleet Control
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                Smart Rental &amp;{" "}
                <span className="text-[#ffcd11]">Heavy Machinery</span> Telematics
              </h1>

              <p className="text-[#8898aa] text-sm leading-relaxed max-w-xl">
                Real-time equipment telemetry · Engine health monitoring · Automated demand forecasting · Generative AI advisory
              </p>

              {/* Live stat pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { icon: Truck, label: `${summary.total_equipment} Assets`, color: "#ffcd11" },
                  { icon: Activity, label: `${summary.active_equipment} Active`, color: "#34d399" },
                  { icon: Zap, label: `${summary.average_utilization}% Utilised`, color: "#38bdf8" },
                ].map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border"
                    style={{
                      background: `${color}10`,
                      borderColor: `${color}25`,
                      color,
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link href="/equipment" className="cat-btn-primary">
                <Truck className="w-4 h-4" /> Telematics Fleet
              </Link>
              <Link href="/map" className="cat-btn-secondary">
                <MapPin className="w-4 h-4" /> GIS Live Map
              </Link>
              <Link href="/chat" className="cat-btn-ghost">
                <Sparkles className="w-4 h-4" /> Cat FleetAI
              </Link>
            </div>
          </div>
        </div>

        {/* ── KPI Telemetrics ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="cat-section-heading">
            Fleet <span className="accent">Telemetrics</span>
          </h2>
          <KPICards summary={summary} />
        </section>

        {/* ── Active Machine Grid ──────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="cat-section-heading">
              Active <span className="accent">Machines</span>
            </h2>
            <Link
              href="/equipment"
              className="text-xs font-extrabold uppercase tracking-wider text-[#ffcd11] hover:text-[#e5b700] flex items-center gap-1.5 group transition-colors"
            >
              Full Fleet <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {recent.map((eq, idx) => {
              const badge = STATUS_BADGE[eq.status] ?? { label: eq.status, className: "cat-badge cat-badge-low" };
              const barColor = STATUS_BAR_COLOR[eq.status] ?? "#5a6a7e";
              const enginePct = Math.min((eq.engine_hours_per_day / 24) * 100, 100);
              const idlePct = eq.engine_hours_per_day > 0
                ? Math.round((eq.idle_hours_per_day / eq.engine_hours_per_day) * 100)
                : 0;

              return (
                <div
                  key={eq.equipment_id}
                  className="cat-card cat-card-interactive flex flex-col group"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Status color bar */}
                  <div className="h-0.5 w-full rounded-t-xl" style={{ background: barColor }} />

                  {/* Card header */}
                  <div className="p-5 border-b border-[#21293a] flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0d1117] border border-[#21293a] flex items-center justify-center shrink-0 group-hover:border-[#ffcd11]/30 transition-colors">
                        <Truck className="w-5 h-5 text-[#ffcd11]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-[#5a6a7e] block leading-none mb-1">
                          ASSET #{eq.equipment_id}
                        </span>
                        <h3 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
                          {eq.equipment_type}
                        </h3>
                      </div>
                    </div>
                    <span className={badge.className}>{badge.label}</span>
                  </div>

                  {/* Metrics grid */}
                  <div className="p-5 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21293a] group-hover:border-[#21293a] transition-colors">
                        <span className="text-[9px] uppercase font-bold text-[#5a6a7e] block mb-1">
                          <MapPin className="w-2.5 h-2.5 inline mr-0.5" />Job Site
                        </span>
                        <span className="font-mono font-bold text-white text-xs">
                          {eq.site_id || "UNASSIGNED"}
                        </span>
                      </div>
                      <div className="bg-[#0d1117] p-3 rounded-lg border border-[#21293a]">
                        <span className="text-[9px] uppercase font-bold text-[#5a6a7e] block mb-1">
                          <Zap className="w-2.5 h-2.5 inline mr-0.5" />Runtime
                        </span>
                        <span className="font-mono font-bold text-[#ffcd11] text-xs">
                          {eq.operating_days || 0} DAYS
                        </span>
                      </div>
                    </div>

                    {/* Engine utilisation mini bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#5a6a7e] font-mono">ENGINE UTIL</span>
                        <span className="font-bold" style={{ color: enginePct > 80 ? "#f87171" : enginePct > 50 ? "#fbbf24" : "#34d399" }}>
                          {eq.engine_hours_per_day.toFixed(1)}h/d
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#21293a] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${enginePct}%`,
                            background: `linear-gradient(90deg, ${barColor}, ${barColor}99)`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#5a6a7e] font-mono">
                        <span>IDLE: {idlePct}%</span>
                        <span>OP: {eq.last_operator_id || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action footer */}
                  <div className="flex border-t border-[#21293a]">
                    <Link
                      href={`/equipment/${eq.equipment_id}`}
                      className="flex-1 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#5a6a7e] hover:text-[#ffcd11] hover:bg-[#ffcd11]/5 transition-all flex items-center justify-center gap-1.5"
                    >
                      Telemetry <ArrowRight className="w-3 h-3" />
                    </Link>
                    <div className="w-px bg-[#21293a]" />
                    <Link
                      href={`/equipment/${eq.equipment_id}/lifecycle`}
                      className="flex-1 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#5a6a7e] hover:text-[#a855f7] hover:bg-[#a855f7]/5 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Activity className="w-3 h-3" /> ROI
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Site Deployment Table ──────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="cat-section-heading">
            Site <span className="accent">Deployment & Fuel</span>
          </h2>

          <div className="cat-card overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-[#21293a] bg-[#0a0c10] flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#ffcd11]" />
                Regional Telematics Overview
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#5a6a7e]">
                  {siteUsage.length} SITES ACTIVE
                </span>
                <Link
                  href="/map"
                  className="text-[10px] font-bold text-[#ffcd11] hover:text-[#e5b700] flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Map View
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="cat-table cat-table-sticky">
                <thead>
                  <tr>
                    <th>Site Location</th>
                    <th>Fleet Count</th>
                    <th className="text-right">Engine Hrs</th>
                    <th className="text-right">Fuel (L)</th>
                    <th className="text-right">Downtime (Hrs)</th>
                    <th className="text-right">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {siteUsage.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-[#5a6a7e]">
                        <Box className="w-8 h-8 mx-auto mb-2 text-[#2d3848]" />
                        <p>No site telemetry recorded yet.</p>
                      </td>
                    </tr>
                  ) : (
                    siteUsage.map((site, idx) => {
                      const efficiency = site.total_operating_hours > 0
                        ? Math.max(0, Math.round(((site.total_operating_hours - site.total_downtime_hours) / site.total_operating_hours) * 100))
                        : 100;
                      return (
                        <tr key={site.site_id} style={{ animationDelay: `${idx * 40}ms` }}>
                          <td className="font-bold text-white font-mono flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: efficiency > 80 ? "#10b981" : efficiency > 60 ? "#f59e0b" : "#ef4444" }}
                            />
                            {site.site_id}
                          </td>
                          <td>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#0d1117] border border-[#21293a] text-[11px] font-mono font-bold text-white">
                              {site.equipment_count} units
                            </span>
                          </td>
                          <td className="text-right font-mono font-bold text-white">
                            {site.total_operating_hours.toFixed(1)}h
                          </td>
                          <td className="text-right font-mono text-[#8898aa]">
                            {site.total_fuel_liters.toFixed(1)} L
                          </td>
                          <td className="text-right font-mono font-bold">
                            <span className={site.total_downtime_hours > 0 ? "text-amber-400" : "text-[#5a6a7e]"}>
                              {site.total_downtime_hours.toFixed(1)}h
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-[#21293a] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${efficiency}%`,
                                    background: efficiency > 80 ? "#10b981" : efficiency > 60 ? "#f59e0b" : "#ef4444",
                                  }}
                                />
                              </div>
                              <span className={`text-[11px] font-bold font-mono ${
                                efficiency > 80 ? "text-emerald-400" :
                                efficiency > 60 ? "text-amber-400" : "text-red-400"
                              }`}>
                                {efficiency}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 text-center bg-[#131820] rounded-xl border border-red-500/30 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Dashboard Offline</h2>
        <p className="text-[#8898aa] text-sm mb-5">
          Could not connect to the Cat VisionLink API backend.
        </p>
        <div className="bg-[#0d1117] rounded-lg p-3 text-left border border-[#21293a] font-mono text-xs text-[#5a6a7e]">
          <p className="text-[#ffcd11] mb-1">$ Fix:</p>
          <p>cd cat-smart-rental\backend</p>
          <p>uvicorn app.main:app --reload</p>
        </div>
      </div>
    );
  }
}
