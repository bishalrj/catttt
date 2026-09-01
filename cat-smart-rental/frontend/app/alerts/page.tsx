import { getOverdueAlerts } from "@/lib/api";
import { Bell, Box, AlertTriangle, Clock } from "lucide-react";
import { AlertRow } from "@/components/alerts/AlertRow";

export default async function AlertsPage() {
  try {
    const alerts = await getOverdueAlerts();
    const overdue = alerts.filter((a) => a.alert_type === "OVERDUE");
    const dueSoon = alerts.filter((a) => a.alert_type === "DUE_SOON");

    return (
      <div className="max-w-7xl mx-auto space-y-8 cat-page-enter">
        {/* Header */}
        <div className="cat-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="cat-section-heading text-xl">
              VisionLink <span className="accent">Overdue &amp; Maintenance Alerts</span>
            </h1>
            <p className="text-[#94a3b8] text-xs sm:text-sm mt-1">
              Automated telemetry monitoring for equipment approaching or exceeding expected return milestones
            </p>
          </div>
          <div className="flex gap-3">
            <div className="cat-badge cat-badge-overdue text-xs px-3.5 py-1.5 font-mono font-bold">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
              {overdue.length} OVERDUE
            </div>
            <div className="cat-badge cat-badge-maintenance text-xs px-3.5 py-1.5 font-mono font-bold">
              <Clock className="w-3.5 h-3.5 inline mr-1.5" />
              {dueSoon.length} DUE SOON
            </div>
          </div>
        </div>

        {/* Alerts Table Card */}
        <div className="cat-card overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="cat-table">
              <thead>
                <tr>
                  <th className="w-10"></th>
                  <th>Asset ID</th>
                  <th>Machine Model</th>
                  <th>Job Site Location</th>
                  <th>Operator</th>
                  <th>Expected Return</th>
                  <th className="text-right">Timeline Delta</th>
                  <th className="text-center">Alert Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-[#64748b]">
                      <Box className="w-8 h-8 mx-auto mb-2 text-[#323b49]" />
                      No overdue or approaching-due equipment right now. All deployments operating on schedule.
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
      <div className="max-w-4xl mx-auto p-10 text-center bg-[#151a21] rounded-lg border border-red-500/40">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Alerts</h2>
        <p className="text-[#94a3b8] text-xs">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
