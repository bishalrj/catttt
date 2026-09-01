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
  increasing: "rm-badge rm-badge-high",
  decreasing: "rm-badge rm-badge-low",
  stable: "rm-badge rm-badge-available",
};

const SEVERITY_BADGE = {
  high: "rm-badge rm-badge-high",
  medium: "rm-badge rm-badge-medium",
  low: "rm-badge rm-badge-low",
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
      <div className="max-w-7xl mx-auto space-y-6 rm-page-enter">
        {/* Header */}
        <div className="rm-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="rm-section-heading text-2xl">
              Demand <span className="accent">Analytics</span>
            </h1>
            <p className="text-rm-text-secondary text-sm mt-1">
              Historical engine-hour trends by site and equipment type, backed by telemetry
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rm-text-muted bg-rm-surface px-3 py-1.5 rounded-lg border border-rm-border">
              {forecast.length} Regional Forecasts
            </span>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="rm-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-rm-text-primary uppercase tracking-wider">
              Average Daily Engine Hours by Site &amp; Type
            </h3>
            <span className="text-xs text-rm-text-muted">Telemetry-based trends</span>
          </div>
          {forecast.length === 0 ? (
            <div className="py-12 text-center text-rm-text-muted">
              <Box className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No usage data available to forecast from yet.
            </div>
          ) : (
            <DemandForecastChart forecast={forecast} />
          )}
        </div>

        {/* Pre-positioning Recommendations */}
        <div className="rm-card overflow-hidden">
          <div className="px-6 py-4 border-b border-rm-border bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rm-text-secondary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rm-red" />
              Pre-Positioning Recommendations
            </h3>
            <span className="text-xs text-rm-text-muted">{actionable.length} Suggestions</span>
          </div>
          {actionable.length === 0 ? (
            <div className="py-8 text-center text-rm-text-muted text-sm">No action needed right now. All site allocations are balanced.</div>
          ) : (
            <div className="divide-y divide-rm-border-light">
              {actionable.map((f) => {
                const Icon = TREND_ICON[f.trend];
                return (
                  <div key={`${f.site_id}-${f.equipment_type}`} className="p-4 sm:px-6 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                    <span className={`shrink-0 ${TREND_BADGE[f.trend]}`}>
                      <Icon className="w-3 h-3 inline-block mr-1" />
                      {f.trend.toUpperCase()}
                    </span>
                    <p className="text-sm text-rm-text-primary font-medium">{f.recommended_action}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detected Anomalies */}
        <div className="rm-card overflow-hidden">
          <div className="px-6 py-4 border-b border-rm-border bg-slate-50 flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rm-text-secondary flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rm-red" />
              Detected Anomalies &amp; GenAI Advisories
            </h3>
            <div className="flex gap-2">
              <span className="rm-badge rm-badge-high">
                {severityCounts.high} HIGH
              </span>
              <span className="rm-badge rm-badge-medium">
                {severityCounts.medium} MEDIUM
              </span>
              <span className="rm-badge rm-badge-low">
                {severityCounts.low} LOW
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="rm-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Site</th>
                  <th>Anomaly Type</th>
                  <th>Telemetry Detail &amp; GenAI Advisory</th>
                  <th className="text-center">Severity</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-rm-text-muted">
                      <Box className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No anomalies detected in the current fleet.
                    </td>
                  </tr>
                ) : (
                  anomalies.map((a, i) => (
                    <tr key={`${a.equipment_id}-${a.anomaly_type}-${i}`}>
                      <td className="font-bold">
                        <Link href={`/equipment/${a.equipment_id}`} className="text-rm-red hover:underline font-mono inline-flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-rm-text-muted" />
                          {a.equipment_id}
                        </Link>
                      </td>
                      <td className="font-medium text-rm-text-primary">{a.equipment_type}</td>
                      <td className="text-rm-text-secondary">{a.site_id ?? "-"}</td>
                      <td className="font-semibold text-rm-text-primary">{ANOMALY_LABEL[a.anomaly_type] ?? a.anomaly_type}</td>
                      <td className="whitespace-normal max-w-sm">
                        <div className="text-xs text-rm-text-secondary mb-1">{a.detail}</div>
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
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-red-200">
        <h2 className="text-xl font-bold text-rm-red mb-2">Error Loading Analytics</h2>
        <p className="text-rm-text-secondary text-sm">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
