import { getDemandForecast, getAnomalies } from "@/lib/api";
import Link from "next/link";
import { LineChart, Box, TrendingUp, TrendingDown, Minus, AlertOctagon } from "lucide-react";
import { DemandForecastChart } from "@/components/dashboard/DemandForecastChart";

const TREND_ICON = {
  increasing: TrendingUp,
  decreasing: TrendingDown,
  stable: Minus,
};

const TREND_STYLE = {
  increasing: "text-industrial-yellow bg-industrial-yellow/10 border-industrial-yellow/30",
  decreasing: "text-slate-400 bg-slate-500/10 border-slate-500/30",
  stable: "text-green-400 bg-green-500/10 border-green-500/30",
};

const SEVERITY_STYLE = {
  high: "text-red-400 bg-red-500/10 border-red-500/30",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  low: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

const ANOMALY_LABEL: Record<string, string> = {
  HIGH_IDLE: "High Idle",
  HIGH_ENGINE: "High Engine Hours",
  LOW_UTIL_LONG_RENTAL: "Low Utilization, Long Rental",
  HIGH_DOWNTIME: "High Downtime",
  UNUSUAL_FUEL: "Unusual Fuel Use",
  UNASSIGNED_EQUIPMENT: "Unassigned Equipment",
};

export default async function AnalyticsPage() {
  try {
    const [forecast, anomalies] = await Promise.all([getDemandForecast(), getAnomalies()]);
    const actionable = forecast.filter((f) => f.recommended_action);
    const severityCounts = {
      high: anomalies.filter((a) => a.severity === "high").length,
      medium: anomalies.filter((a) => a.severity === "medium").length,
      low: anomalies.filter((a) => a.severity === "low").length,
    };

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <LineChart className="w-6 h-6 text-industrial-yellow" /> DEMAND ANALYTICS
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Historical engine-hour trends by site and equipment type, from usage telemetry
            </p>
          </div>
        </div>

        <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Average Daily Engine Hours by Site &amp; Type
          </h3>
          {forecast.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Box className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              No usage data available to forecast from yet.
            </div>
          ) : (
            <DemandForecastChart forecast={forecast} />
          )}
        </div>

        <div className="bg-graphite-900 border border-graphite-700 rounded-md overflow-hidden">
          <div className="p-4 border-b border-graphite-700 bg-graphite-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Pre-Positioning Recommendations
            </h3>
          </div>
          {actionable.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No action needed right now.</div>
          ) : (
            <div className="divide-y divide-graphite-700/50">
              {actionable.map((f) => {
                const Icon = TREND_ICON[f.trend];
                return (
                  <div key={`${f.site_id}-${f.equipment_type}`} className="p-4 flex items-start gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-sm border shrink-0 ${TREND_STYLE[f.trend]}`}>
                      <Icon className="w-3 h-3" />
                      {f.trend.toUpperCase()}
                    </span>
                    <p className="text-sm text-slate-300">{f.recommended_action}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-graphite-900 border border-graphite-700 rounded-md overflow-hidden">
          <div className="p-4 border-b border-graphite-700 bg-graphite-800 flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-industrial-yellow" />
              Detected Anomalies
            </h3>
            <div className="flex gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-sm border ${SEVERITY_STYLE.high}`}>
                {severityCounts.high} HIGH
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-sm border ${SEVERITY_STYLE.medium}`}>
                {severityCounts.medium} MEDIUM
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-sm border ${SEVERITY_STYLE.low}`}>
                {severityCounts.low} LOW
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-400 uppercase bg-graphite-950/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Asset</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Site</th>
                  <th className="px-5 py-3 font-medium">Anomaly</th>
                  <th className="px-5 py-3 font-medium">Detail</th>
                  <th className="px-5 py-3 font-medium text-center">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/50">
                {anomalies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      <Box className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                      No anomalies detected in the current fleet.
                    </td>
                  </tr>
                ) : (
                  anomalies.map((a, i) => (
                    <tr key={`${a.equipment_id}-${a.anomaly_type}-${i}`} className="hover:bg-graphite-800/50 transition-colors">
                      <td className="px-5 py-3 font-medium">
                        <Link href={`/equipment/${a.equipment_id}`} className="text-industrial-yellow hover:underline">
                          {a.equipment_id}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{a.equipment_type}</td>
                      <td className="px-5 py-3 text-slate-300">{a.site_id ?? "-"}</td>
                      <td className="px-5 py-3 text-slate-300">{ANOMALY_LABEL[a.anomaly_type] ?? a.anomaly_type}</td>
                      <td className="px-5 py-3 text-slate-400 whitespace-normal">{a.detail}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-sm border ${SEVERITY_STYLE[a.severity]}`}>
                          {a.severity.toUpperCase()}
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
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center bg-graphite-900 rounded-xl shadow-sm border border-red-500/30">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Analytics</h2>
        <p className="text-slate-400">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
