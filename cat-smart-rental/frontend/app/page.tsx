import { getDashboardSummary, getEquipmentList, getSiteUsageSummary } from "@/lib/api";
import { KPICards } from "@/components/dashboard/KPICards";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, Box } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "text-green-400 bg-green-500/10 border-green-500/30",
  ACTIVE: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  OVERDUE: "text-red-400 bg-red-500/10 border-red-500/30",
  MAINTENANCE: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
};

export default async function DashboardPage() {
  try {
    const summary = await getDashboardSummary();
    const equipment = await getEquipmentList();
    const siteUsage = await getSiteUsageSummary();
    const recent = equipment.slice(0, 5); // Just grab first 5 for recent

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-industrial-yellow" /> DASHBOARD
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Overview of your rental fleet</p>
        </div>

        <KPICards summary={summary} />

        <div className="bg-graphite-900 border border-graphite-700 rounded-md overflow-hidden">
          <div className="p-4 border-b border-graphite-700 bg-graphite-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recent Equipment</h3>
            <Link href="/equipment" className="text-sm text-industrial-yellow hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-400 uppercase bg-graphite-950/50">
                <tr>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Site</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/50">
                {recent.map((eq) => (
                  <tr key={eq.equipment_id} className="hover:bg-graphite-800/50 transition-colors">
                    <td className="px-5 py-3 font-medium">
                      <Link href={`/equipment/${eq.equipment_id}`} className="text-industrial-yellow hover:underline">
                        {eq.equipment_id}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{eq.equipment_type}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-sm border ${STATUS_STYLE[eq.status]}`}>
                        {eq.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{eq.site_id || <span className="text-slate-600">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-graphite-900 border border-graphite-700 rounded-md overflow-hidden">
          <div className="p-4 border-b border-graphite-700 bg-graphite-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Usage by Site</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-400 uppercase bg-graphite-950/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Site</th>
                  <th className="px-5 py-3 font-medium">Equipment</th>
                  <th className="px-5 py-3 font-medium text-right">Runtime Hours</th>
                  <th className="px-5 py-3 font-medium text-right">Fuel (L)</th>
                  <th className="px-5 py-3 font-medium text-right">Downtime Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/50">
                {siteUsage.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      <Box className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                      No usage data recorded yet.
                    </td>
                  </tr>
                ) : (
                  siteUsage.map((site) => (
                    <tr key={site.site_id} className="hover:bg-graphite-800/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-white">{site.site_id}</td>
                      <td className="px-5 py-3 text-slate-300">{site.equipment_count}</td>
                      <td className="px-5 py-3 text-slate-300 text-right font-mono">{site.total_operating_hours.toFixed(1)}</td>
                      <td className="px-5 py-3 text-slate-300 text-right font-mono">{site.total_fuel_liters.toFixed(1)}</td>
                      <td className="px-5 py-3 text-slate-300 text-right font-mono">{site.total_downtime_hours.toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center bg-graphite-900 rounded-xl shadow-sm border border-red-500/30">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Dashboard</h2>
        <p className="text-slate-400">Could not connect to the API. Ensure the backend is running.</p>
      </div>
    );
  }
}
