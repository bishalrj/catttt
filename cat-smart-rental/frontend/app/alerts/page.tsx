import { getOverdueAlerts } from "@/lib/api";
import { Bell, AlertTriangle, Clock, Activity, ShieldCheck } from "lucide-react";
import { AlertsClient } from "@/components/alerts/AlertsClient";

export default async function AlertsPage() {
  try {
    const alerts = await getOverdueAlerts();
    const overdue  = alerts.filter((a) => a.alert_type === "OVERDUE").length;
    const dueSoon  = alerts.filter((a) => a.alert_type === "DUE_SOON").length;
    const health   = Math.max(0, Math.round(100 - (overdue * 15) - (dueSoon * 5)));

    return (
      <div className="max-w-[1400px] mx-auto space-y-6 cat-page-enter">
        {/* Header */}
        <div className="cat-page-header flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="cat-section-heading text-xl">
                VisionLink <span className="accent">Alerts</span>
              </h1>
              <p className="text-[#8898aa] text-sm mt-1">
                Automated telemetry monitoring for equipment approaching or exceeding return milestones
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <div className="cat-badge cat-badge-overdue text-xs px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                {overdue} OVERDUE
              </div>
              <div className="cat-badge cat-badge-maintenance text-xs px-3 py-1.5">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                {dueSoon} DUE SOON
              </div>
            </div>
          </div>

          {/* Fleet Health Meter */}
          <div className="bg-[#0d1117] rounded-xl border border-[#21293a] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#8898aa] flex items-center gap-2">
                {health > 80
                  ? <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  : <Activity className="w-4 h-4 text-amber-400" />
                }
                Fleet Health Score
              </span>
              <span className={`text-2xl font-black font-mono ${
                health > 80 ? "text-emerald-400" : health > 60 ? "text-amber-400" : "text-red-400"
              }`}>
                {health}
                <span className="text-sm font-mono text-[#5a6a7e]">/100</span>
              </span>
            </div>
            <div className="h-2.5 bg-[#21293a] rounded-full overflow-hidden">
              <div
                className="cat-severity-fill h-full rounded-full"
                style={{
                  width: `${health}%`,
                  background: health > 80
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : health > 60
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "linear-gradient(90deg, #ef4444, #f87171)",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#5a6a7e]">
              <span>CRITICAL</span>
              <span>WARNING</span>
              <span>HEALTHY</span>
            </div>
          </div>
        </div>

        {/* Alert list */}
        <AlertsClient alerts={alerts} />
      </div>
    );
  } catch {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 text-center bg-[#131820] rounded-xl border border-red-500/30">
        <Bell className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Alert Feed Offline</h2>
        <p className="text-[#8898aa] text-sm">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
