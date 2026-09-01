import { getDashboardSummary, getEquipmentList, getSiteUsageSummary } from "@/lib/api";
import { KPICards } from "@/components/dashboard/KPICards";
import Link from "next/link";
import { ArrowRight, Box, ChevronRight, Sparkles, Truck, ShieldAlert, Zap } from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "rm-badge rm-badge-available" },
  ACTIVE: { label: "Active", className: "rm-badge rm-badge-active" },
  OVERDUE: { label: "Overdue", className: "rm-badge rm-badge-overdue" },
  MAINTENANCE: { label: "Maintenance", className: "rm-badge rm-badge-maintenance" },
};

export default async function DashboardPage() {
  try {
    const summary = await getDashboardSummary();
    const equipment = await getEquipmentList();
    const siteUsage = await getSiteUsageSummary();
    const recent = equipment.slice(0, 6);

    return (
      <div className="max-w-7xl mx-auto space-y-8 rm-page-enter">
        {/* RentoMojo-style Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white p-7 sm:p-9 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              Smart CAT Fleet 2.0
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Industrial Fleet Rental &amp; AI Telemetry
            </h1>
            <p className="text-red-100 text-sm sm:text-base leading-relaxed">
              Track real-time machine operations, forecast regional demand, and generate instant generative fleet advisories.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 z-10">
            <Link
              href="/equipment"
              className="bg-white text-rm-red font-bold px-5 py-2.5 rounded-xl hover:bg-red-50 transition-all shadow-sm inline-flex items-center gap-2 text-sm"
            >
              <Truck className="w-4 h-4" /> Browse Equipment
            </Link>
            <Link
              href="/chat"
              className="bg-black/30 backdrop-blur-md text-white border border-white/30 font-semibold px-5 py-2.5 rounded-xl hover:bg-black/40 transition-all text-sm inline-flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-yellow-300" /> Ask FleetAI
            </Link>
          </div>
        </div>

        {/* Section 1: KPI Stats */}
        <div className="space-y-3">
          <h2 className="rm-section-heading">
            Fleet <span className="accent">Performance</span>
          </h2>
          <KPICards summary={summary} />
        </div>

        {/* Section 2: Equipment Grid (RentoMojo Product / Category style) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="rm-section-heading">
              Featured <span className="accent">Equipment</span>
            </h2>
            <Link
              href="/equipment"
              className="text-sm font-semibold text-rm-red hover:text-rm-red-hover flex items-center gap-1 group"
            >
              View all fleet <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recent.map((eq) => {
              const badge = STATUS_BADGE[eq.status] || { label: eq.status, className: "rm-badge rm-badge-low" };
              return (
                <div key={eq.equipment_id} className="rm-product-card flex flex-col justify-between">
                  <div className="rm-card-image relative p-6 bg-slate-50 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-rm-border flex items-center justify-center shadow-sm">
                      <Truck className="w-10 h-10 text-rm-red" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={badge.className}>{badge.label}</span>
                    </div>
                    <div className="absolute bottom-2 left-3 text-[11px] font-mono text-rm-text-muted">
                      ID: {eq.equipment_id}
                    </div>
                  </div>
                  <div className="rm-card-body flex-1">
                    <h3 className="rm-card-name text-base font-bold text-rm-text-primary">
                      {eq.equipment_type}
                    </h3>
                    <p className="text-xs text-rm-text-secondary mt-0.5">
                      Site: <span className="font-semibold text-rm-text-primary">{eq.site_id || "Unassigned"}</span>
                    </p>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-rm-border-light">
                      <div>
                        <span className="rm-card-price-label block">Runtime</span>
                        <span className="rm-card-price text-sm font-semibold">{eq.operating_days || 0} days</span>
                      </div>
                      <Link
                        href={`/equipment/${eq.equipment_id}/lifecycle`}
                        className="text-xs font-bold text-rm-purple bg-rm-purple-light hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Lifecycle ROI &rarr;
                      </Link>
                    </div>
                  </div>
                  <Link
                    href={`/equipment/${eq.equipment_id}`}
                    className="rm-card-cta flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-rm-red-light transition-colors"
                  >
                    View Asset Telemetry <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Usage by Site (Clean Table Card) */}
        <div className="space-y-4">
          <h2 className="rm-section-heading">
            Site <span className="accent">Utilization</span>
          </h2>

          <div className="rm-card overflow-hidden">
            <div className="px-6 py-4 border-b border-rm-border bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rm-text-secondary">
                Regional Deployment Telemetry
              </span>
              <span className="text-xs text-rm-text-muted">
                {siteUsage.length} active work sites
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="rm-table">
                <thead>
                  <tr>
                    <th>Site Location</th>
                    <th>Equipment Deployed</th>
                    <th className="text-right">Runtime (Hours)</th>
                    <th className="text-right">Fuel Used (Liters)</th>
                    <th className="text-right">Downtime (Hours)</th>
                  </tr>
                </thead>
                <tbody>
                  {siteUsage.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-rm-text-muted">
                        <Box className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No site telemetry logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    siteUsage.map((site) => (
                      <tr key={site.site_id}>
                        <td className="font-bold text-rm-text-primary flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rm-red"></span>
                          {site.site_id}
                        </td>
                        <td className="text-rm-text-secondary">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rm-surface text-xs font-semibold">
                            {site.equipment_count} units
                          </span>
                        </td>
                        <td className="text-right font-mono font-semibold text-rm-text-primary">
                          {site.total_operating_hours.toFixed(1)}h
                        </td>
                        <td className="text-right font-mono text-rm-text-secondary">
                          {site.total_fuel_liters.toFixed(1)} L
                        </td>
                        <td className="text-right font-mono font-semibold">
                          <span className={site.total_downtime_hours > 0 ? "text-amber-600 font-bold" : "text-rm-text-muted"}>
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
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-red-200">
        <h2 className="text-xl font-bold text-rm-red mb-2">Error Loading Dashboard</h2>
        <p className="text-rm-text-secondary text-sm">Could not connect to the API. Ensure backend is running.</p>
      </div>
    );
  }
}
