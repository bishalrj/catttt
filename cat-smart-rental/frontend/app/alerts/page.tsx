import { getOverdueAlerts } from "@/lib/api";
import { Bell, Box, AlertTriangle, Clock } from "lucide-react";
import { AlertRow } from "@/components/alerts/AlertRow";

export default async function AlertsPage() {
  try {
    const alerts = await getOverdueAlerts();
    const overdue = alerts.filter((a) => a.alert_type === "OVERDUE");
    const dueSoon = alerts.filter((a) => a.alert_type === "DUE_SOON");

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-industrial-yellow" /> OVERDUE ALERTS
          </h1>
          <p className="text-slate-400 mt-1 text-sm mb-4">
            Equipment approaching or past its expected return date
          </p>
          <div className="flex gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-sm">
              <AlertTriangle className="w-4 h-4" />
              {overdue.length} OVERDUE
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-sm">
              <Clock className="w-4 h-4" />
              {dueSoon.length} DUE SOON
            </div>
          </div>
        </div>

        <div className="bg-graphite-900 border border-graphite-700 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-400 uppercase bg-graphite-950/50">
                <tr>
                  <th className="px-5 py-3 font-medium"></th>
                  <th className="px-5 py-3 font-medium">Asset</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Site</th>
                  <th className="px-5 py-3 font-medium">Operator</th>
                  <th className="px-5 py-3 font-medium">Expected Return</th>
                  <th className="px-5 py-3 font-medium text-right">Delta</th>
                  <th className="px-5 py-3 font-medium text-center">Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/50">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                      <Box className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                      No overdue or approaching-due equipment right now.
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert) => <AlertRow key={alert.equipment_id} alert={alert} />)
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
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Alerts</h2>
        <p className="text-slate-400">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
