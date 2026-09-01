import { getDashboardSummary, getEquipmentList, getSiteUsageSummary } from "@/lib/api";
import { KPICards } from "@/components/dashboard/KPICards";
import Link from "next/link";
import { ArrowRight, Box, ChevronRight, Sparkles, Truck, Gauge, Radio } from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "AVAILABLE", className: "cat-badge cat-badge-available" },
  ACTIVE: { label: "ACTIVE", className: "cat-badge cat-badge-active" },
  OVERDUE: { label: "OVERDUE", className: "cat-badge cat-badge-overdue" },
  MAINTENANCE: { label: "MAINTENANCE", className: "cat-badge cat-badge-maintenance" },
};

export default async function DashboardPage() {
  try {
    const summary = await getDashboardSummary();
    const equipment = await getEquipmentList();
    const siteUsage = await getSiteUsageSummary();
    const recent = equipment.slice(0, 6);

    return (
      <div className="max-w-7xl mx-auto space-y-10 cat-page-enter">
        {/* Caterpillar VisionLink Hero Command Banner */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#12161c] via-[#181d24] to-[#12161c] border border-[#262d38] p-7 sm:p-9 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ffcd11]" />
          <div className="space-y-3 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-[#ffcd11]/15 border border-[#ffcd11]/30 px-3 py-1 rounded text-[11px] font-black text-[#ffcd11] tracking-wider uppercase">
              <Radio className="w-3.5 h-3.5 text-[#ffcd11] animate-pulse" />
              Cat&reg; VisionLink&reg; Unified Fleet Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-tight">
              Smart Rental &amp; Heavy Machinery Telematics
            </h1>
            <p className="text-[#94a3b8] text-xs sm:text-sm leading-relaxed">
              Real-time equipment telemetry, engine health monitoring, automated demand forecasting, and generative AI advisory.
            </p>
          </div>
          <div className="flex flex-wrap gap-3.5 z-10 shrink-0">
            <Link
              href="/equipment"
              className="cat-btn-primary"
            >
              <Truck className="w-4 h-4" /> Telematics Fleet
            </Link>
            <Link
              href="/chat"
              className="cat-btn-secondary"
            >
              <Sparkles className="w-4 h-4 text-[#ffcd11]" /> Cat FleetAI
            </Link>
          </div>
        </div>

        {/* Section 1: KPI Telemetrics */}
        <div className="space-y-4">
          <h2 className="cat-section-heading">
            Fleet <span className="accent">Telemetrics</span>
          </h2>
          <KPICards summary={summary} />
        </div>

        {/* Section 2: Equipment Grid (VisionLink Machine Cards) */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="cat-section-heading">
              Active <span className="accent">Machines</span>
            </h2>
            <Link
              href="/equipment"
              className="text-xs font-extrabold uppercase tracking-wider text-[#ffcd11] hover:text-[#e5b700] flex items-center gap-1.5 group"
            >
              View Full Fleet <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((eq) => {
              const badge = STATUS_BADGE[eq.status] || { label: eq.status, className: "cat-badge cat-badge-low" };
              return (
                <div key={eq.equipment_id} className="cat-card flex flex-col justify-between overflow-hidden shadow-md">
                  <div className="p-6 bg-[#12161c] border-b border-[#262d38] flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded bg-[#181d24] border border-[#262d38] flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-[#ffcd11]" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-[#64748b] block leading-none mb-1">
                          ASSET #{eq.equipment_id}
                        </span>
                        <h3 className="text-sm font-black text-white uppercase tracking-wide">
                          {eq.equipment_type}
                        </h3>
                      </div>
                    </div>
                    <span className={badge.className}>{badge.label}</span>
                  </div>

                  <div className="p-6 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#12161c] p-3 rounded border border-[#262d38]">
                        <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-0.5">Job Site</span>
                        <span className="font-mono font-bold text-white text-xs">{eq.site_id || "UNASSIGNED"}</span>
                      </div>
                      <div className="bg-[#12161c] p-3 rounded border border-[#262d38]">
                        <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-0.5">Operating Runtime</span>
                        <span className="font-mono font-bold text-[#ffcd11] text-xs">{eq.operating_days || 0} DAYS</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#262d38] text-xs">
                      <div className="text-[#94a3b8] font-mono text-[11px]">
                        Engine: <span className="text-white font-bold">{eq.engine_hours_per_day.toFixed(1)}h/d</span>
                      </div>
                      <Link
                        href={`/equipment/${eq.equipment_id}/lifecycle`}
                        className="text-[11px] font-bold text-[#ffcd11] hover:underline flex items-center gap-1 uppercase tracking-wider"
                      >
                        Lifecycle ROI &rarr;
                      </Link>
                    </div>
                  </div>

                  <Link
                    href={`/equipment/${eq.equipment_id}`}
                    className="px-5 py-3 bg-[#12161c] border-t border-[#262d38] text-center text-xs font-bold uppercase tracking-wider text-[#94a3b8] hover:text-[#ffcd11] hover:bg-[#181d24] transition-colors flex items-center justify-center gap-1.5"
                  >
                    VisionLink Telemetry Detail <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Usage by Site (VisionLink Telematics Table) */}
        <div className="space-y-5">
          <h2 className="cat-section-heading">
            Site <span className="accent">Deployment &amp; Fuel</span>
          </h2>

          <div className="cat-card overflow-hidden shadow-md">
            <div className="px-6 py-4 border-b border-[#262d38] bg-[#11151b] flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#ffcd11]" /> Regional Telematics Overview
              </span>
              <span className="text-xs font-mono text-[#64748b]">
                {siteUsage.length} SITES ACTIVE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="cat-table">
                <thead>
                  <tr>
                    <th>Site Location</th>
                    <th>Machinery Count</th>
                    <th className="text-right">Total Engine (Hrs)</th>
                    <th className="text-right">Fuel Consumed (L)</th>
                    <th className="text-right">Downtime (Hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {siteUsage.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-14 text-center text-[#64748b]">
                        <Box className="w-8 h-8 mx-auto mb-2 text-[#323b49]" />
                        No site telemetry recorded yet.
                      </td>
                    </tr>
                  ) : (
                    siteUsage.map((site) => (
                      <tr key={site.site_id}>
                        <td className="font-bold text-white font-mono flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-xs bg-[#ffcd11]"></span>
                          {site.site_id}
                        </td>
                        <td className="text-[#94a3b8]">
                          <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#12161c] border border-[#262d38] text-xs font-mono font-semibold">
                            {site.equipment_count} UNITS
                          </span>
                        </td>
                        <td className="text-right font-mono font-bold text-white">
                          {site.total_operating_hours.toFixed(1)}h
                        </td>
                        <td className="text-right font-mono text-[#94a3b8]">
                          {site.total_fuel_liters.toFixed(1)} L
                        </td>
                        <td className="text-right font-mono font-bold">
                          <span className={site.total_downtime_hours > 0 ? "text-amber-400" : "text-[#64748b]"}>
                            {site.total_downtime_hours.toFixed(1)}h
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center bg-[#151a21] rounded-lg border border-red-500/40">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Cat VisionLink Dashboard</h2>
        <p className="text-[#94a3b8] text-xs">Could not connect to the API. Ensure backend is running.</p>
      </div>
    );
  }
}
