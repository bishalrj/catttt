import { getOverdueAlerts } from "@/lib/api";
import { Bell, Box, AlertTriangle, Clock } from "lucide-react";
import { AlertRow } from "@/components/alerts/AlertRow";

export default async function AlertsPage() {
  try {
    const alerts = await getOverdueAlerts();
    const overdue = alerts.filter((a) => a.alert_type === "OVERDUE");
    const dueSoon = alerts.filter((a) => a.alert_type === "DUE_SOON");

    return (
      <div className="max-w-7xl mx-auto space-y-6 rm-page-enter">
        {/* Header */}
        <div className="rm-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="rm-section-heading text-2xl">
              Overdue <span className="accent">Alerts</span>
            </h1>
            <p className="text-rm-text-secondary text-sm mt-1">
              Real-time monitor for equipment approaching or past its expected return date
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rm-badge rm-badge-overdue text-xs px-3 py-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
              {overdue.length} OVERDUE
            </div>
            <div className="rm-badge rm-badge-maintenance text-xs px-3 py-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              {dueSoon.length} DUE SOON
            </div>
          </div>
        </div>

        {/* Alerts Table Card */}
        <div className="rm-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rm-table">
              <thead>
                <tr>
                  <th className="w-8"></th>
                  <th>Asset ID</th>
                  <th>Type</th>
                  <th>Site Location</th>
                  <th>Operator</th>
                  <th>Expected Return</th>
                  <th className="text-right">Timeline Delta</th>
                  <th className="text-center">Alert Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-rm-text-muted">
                      <Box className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No overdue or approaching-due equipment right now. All rentals on track!
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
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-red-200">
        <h2 className="text-xl font-bold text-rm-red mb-2">Error Loading Alerts</h2>
        <p className="text-rm-text-secondary text-sm">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
