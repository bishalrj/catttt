import { getDemandForecast, getAnomalies } from "@/lib/api";
import Link from "next/link";
import { LineChart, Box, TrendingUp, TrendingDown, Minus, AlertOctagon, Sparkles, Cpu } from "lucide-react";
import { DemandForecastChart } from "@/components/dashboard/DemandForecastChart";
import { AnomalyNarrative } from "@/components/ai/AnomalyNarrative";

const TREND_ICON = {
  increasing: TrendingUp,
  decreasing: TrendingDown,
  stable: Minus,
};

const TREND_BADGE = {
  increasing: "cat-badge cat-badge-active",
  decreasing: "cat-badge cat-badge-low",
  stable: "cat-badge cat-badge-available",
};

const SEVERITY_BADGE = {
  high: "cat-badge cat-badge-high",
  medium: "cat-badge cat-badge-medium",
  low: "cat-badge cat-badge-low",
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
      <div className="max-w-7xl mx-auto space-y-6 cat-page-enter">
        {/* Header */}
        <div className="cat-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="cat-section-heading text-xl">
              Demand <span className="accent">Analytics &amp; ML Forecasts</span>
            </h1>
            <p className="text-[#94a3b8] text-xs mt-1">
              Historical engine-hour telematics, site demand curves, and automated equipment pre-positioning
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#ffcd11] bg-[#12161c] px-3 py-1.5 rounded border border-[#262d38]">
              {forecast.length} REGIONAL MODELS ACTIVE
            </span>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="cat-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Average Daily Engine Hours by Site &amp; Equipment Model
            </h3>
            <span className="text-xs font-mono text-[#64748b]">TELEMETRIC DATA TRENDS</span>
          </div>
          {forecast.length === 0 ? (
            <div className="py-12 text-center text-[#64748b]">
              <Box className="w-8 h-8 mx-auto mb-2 text-[#323b49]" />
              No usage data available to forecast from yet.
            </div>
          ) : (
            <DemandForecastChart forecast={forecast} />
          )}
        </div>

        {/* Pre-positioning Recommendations */}
        <div className="cat-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#262d38] bg-[#11151b] flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ffcd11]" />
              Pre-Positioning Recommendations
            </h3>
            <span className="text-xs font-mono text-[#64748b]">{actionable.length} ACTIONABLE</span>
          </div>
          {actionable.length === 0 ? (
            <div className="py-8 text-center text-[#64748b] text-xs">No reallocations required. Fleet allocation is currently balanced.</div>
          ) : (
            <div className="divide-y divide-[#1e242d]">
              {actionable.map((f) => {
                const Icon = TREND_ICON[f.trend];
                return (
                  <div key={`${f.site_id}-${f.equipment_type}`} className="p-4 sm:px-5 flex items-start gap-3 hover:bg-[#181d24] transition-colors">
                    <span className={`shrink-0 ${TREND_BADGE[f.trend]}`}>
                      <Icon className="w-3 h-3 inline-block mr-1" />
                      {f.trend.toUpperCase()}
                    </span>
                    <p className="text-xs text-[#f1f5f9] font-medium leading-relaxed">{f.recommended_action}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detected Anomalies */}
        <div className="cat-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#262d38] bg-[#11151b] flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#ffcd11]" />
              VisionLink Telemetry Anomalies &amp; GenAI Advisories
            </h3>
            <div className="flex gap-2">
              <span className="cat-badge cat-badge-high font-mono">
                {severityCounts.high} HIGH
              </span>
              <span className="cat-badge cat-badge-medium font-mono">
                {severityCounts.medium} MEDIUM
              </span>
              <span className="cat-badge cat-badge-low font-mono">
                {severityCounts.low} LOW
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Site</th>
                  <th>Anomaly Flag</th>
                  <th>Telemetric Details &amp; Cat GenAI Advisory</th>
                  <th className="text-center">Severity</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#64748b]">
                      <Box className="w-8 h-8 mx-auto mb-2 text-[#323b49]" />
                      No anomalies detected in the current fleet telemetry.
                    </td>
                  </tr>
                ) : (
                  anomalies.map((a, i) => (
                    <tr key={`${a.equipment_id}-${a.anomaly_type}-${i}`}>
                      <td className="font-bold">
                        <Link href={`/equipment/${a.equipment_id}`} className="text-[#ffcd11] hover:underline font-mono inline-flex items-center gap-1.5 text-xs">
                          <Cpu className="w-3.5 h-3.5 text-[#64748b]" />
                          {a.equipment_id}
                        </Link>
                      </td>
                      <td className="font-bold text-white text-xs uppercase">{a.equipment_type}</td>
                      <td className="text-[#94a3b8] font-mono text-xs">{a.site_id ?? "-"}</td>
                      <td className="font-bold text-[#f1f5f9] text-xs">{ANOMALY_LABEL[a.anomaly_type] ?? a.anomaly_type}</td>
                      <td className="whitespace-normal max-w-sm">
                        <div className="text-xs text-[#94a3b8] mb-1">{a.detail}</div>
                        <AnomalyNarrative anomaly={a} />
                      </td>
                      <td className="text-center">
                        <span className={SEVERITY_BADGE[a.severity]}>
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
      <div className="max-w-4xl mx-auto p-8 text-center bg-[#151a21] rounded-lg border border-red-500/40">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Analytics</h2>
        <p className="text-[#94a3b8] text-xs">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
