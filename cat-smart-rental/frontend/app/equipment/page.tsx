import { getEquipmentList } from "@/lib/api";
import Link from "next/link";
import { EquipmentRowActions } from "@/components/equipment/EquipmentRowActions";
import { Truck, Box, Cpu, Sparkles, Filter, Activity } from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "rm-badge rm-badge-available" },
  ACTIVE: { label: "Active", className: "rm-badge rm-badge-active" },
  OVERDUE: { label: "Overdue", className: "rm-badge rm-badge-overdue" },
  MAINTENANCE: { label: "Maintenance", className: "rm-badge rm-badge-maintenance" },
};

export default async function EquipmentPage() {
  try {
    const equipment = await getEquipmentList();

    return (
      <div className="max-w-7xl mx-auto space-y-6 rm-page-enter">
        {/* Header */}
        <div className="rm-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="rm-section-heading text-2xl">
              Equipment <span className="accent">Catalog</span>
            </h1>
            <p className="text-rm-text-secondary text-sm mt-1">
              Industrial fleet machinery, telemetry statuses, and lifecycle actions
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-rm-text-muted bg-rm-surface px-3 py-1.5 rounded-lg border border-rm-border">
              {equipment.length} Fleet Units
            </span>
          </div>
        </div>

        {/* Equipment Table Card */}
        <div className="rm-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rm-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Machine Type</th>
                  <th>Status</th>
                  <th>Site Location</th>
                  <th className="text-right">Engine Hrs/Day</th>
                  <th className="text-right">Idle Hrs/Day</th>
                  <th className="text-right">Operating Days</th>
                  <th>Operator</th>
                  <th className="text-center">Lifecycle</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {equipment.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-rm-text-muted">
                      <Box className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No equipment fleet records found.
                    </td>
                  </tr>
                ) : (
                  equipment.map((eq) => {
                    const badge = STATUS_BADGE[eq.status] || { label: eq.status, className: "rm-badge rm-badge-low" };
                    return (
                      <tr key={eq.equipment_id}>
                        <td className="font-bold">
                          <Link
                            href={`/equipment/${eq.equipment_id}`}
                            className="text-rm-red hover:underline inline-flex items-center gap-1.5 font-mono"
                          >
                            <Cpu className="w-3.5 h-3.5 text-rm-text-muted" />
                            {eq.equipment_id}
                          </Link>
                        </td>
                        <td className="font-semibold text-rm-text-primary">
                          {eq.equipment_type}
                        </td>
                        <td>
                          <span className={badge.className}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="text-rm-text-secondary">
                          {eq.site_id ? (
                            <span className="font-medium text-rm-text-primary">{eq.site_id}</span>
                          ) : (
                            <span className="text-rm-text-muted">-</span>
                          )}
                        </td>
                        <td className="text-right font-mono text-rm-text-primary font-medium">
                          {eq.engine_hours_per_day.toFixed(1)}h
                        </td>
                        <td className="text-right font-mono text-rm-text-secondary">
                          {eq.idle_hours_per_day.toFixed(1)}h
                        </td>
                        <td className="text-right font-mono text-rm-text-primary font-semibold">
                          {eq.operating_days} d
                        </td>
                        <td className="text-rm-text-secondary text-xs">
                          {eq.last_operator_id || <span className="text-rm-text-muted">-</span>}
                        </td>
                        <td className="text-center">
                          <Link
                            href={`/equipment/${eq.equipment_id}/lifecycle`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rm-purple bg-rm-purple-light hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <Activity className="w-3 h-3" /> ROI
                          </Link>
                        </td>
                        <td className="text-right">
                          <EquipmentRowActions equipmentId={eq.equipment_id} status={eq.status} />
                        </td>
                      </tr>
                    );
                  })
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
        <h2 className="text-xl font-bold text-rm-red mb-2">Error Loading Fleet</h2>
        <p className="text-rm-text-secondary text-sm">Could not connect to fleet api.</p>
      </div>
    );
  }
}
