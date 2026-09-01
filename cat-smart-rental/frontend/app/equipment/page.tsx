import { getEquipmentList } from "@/lib/api";
import Link from "next/link";
import { EquipmentRowActions } from "@/components/equipment/EquipmentRowActions";
import { Truck, Box, Cpu, Activity, ShieldCheck } from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "AVAILABLE", className: "cat-badge cat-badge-available" },
  ACTIVE: { label: "ACTIVE", className: "cat-badge cat-badge-active" },
  OVERDUE: { label: "OVERDUE", className: "cat-badge cat-badge-overdue" },
  MAINTENANCE: { label: "MAINTENANCE", className: "cat-badge cat-badge-maintenance" },
};

export default async function EquipmentPage() {
  try {
    const equipment = await getEquipmentList();

    return (
      <div className="max-w-7xl mx-auto space-y-6 cat-page-enter">
        {/* Header */}
        <div className="cat-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="cat-section-heading text-xl">
              Cat Fleet <span className="accent">Telematics</span>
            </h1>
            <p className="text-[#94a3b8] text-xs mt-1">
              Industrial machinery telemetry, operational statuses, and lifecycle command oversight
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-[#ffcd11] bg-[#12161c] px-3 py-1.5 rounded border border-[#262d38]">
              {equipment.length} ASSETS LOGGED
            </span>
          </div>
        </div>

        {/* Equipment Table Card */}
        <div className="cat-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Machine Model / Type</th>
                  <th>Status</th>
                  <th>Job Site Location</th>
                  <th className="text-right">Engine (Hrs/Day)</th>
                  <th className="text-right">Idle (Hrs/Day)</th>
                  <th className="text-right">Operating Days</th>
                  <th>Operator</th>
                  <th className="text-center">Lifecycle</th>
                  <th className="text-right">Command</th>
                </tr>
              </thead>
              <tbody>
                {equipment.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#64748b]">
                      <Box className="w-8 h-8 mx-auto mb-2 text-[#323b49]" />
                      No equipment fleet records found.
                    </td>
                  </tr>
                ) : (
                  equipment.map((eq) => {
                    const badge = STATUS_BADGE[eq.status] || { label: eq.status, className: "cat-badge cat-badge-low" };
                    return (
                      <tr key={eq.equipment_id}>
                        <td className="font-bold">
                          <Link
                            href={`/equipment/${eq.equipment_id}`}
                            className="text-[#ffcd11] hover:underline inline-flex items-center gap-1.5 font-mono text-xs"
                          >
                            <Cpu className="w-3.5 h-3.5 text-[#64748b]" />
                            {eq.equipment_id}
                          </Link>
                        </td>
                        <td className="font-bold text-white uppercase text-xs">
                          {eq.equipment_type}
                        </td>
                        <td>
                          <span className={badge.className}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="text-[#94a3b8] font-mono text-xs">
                          {eq.site_id ? (
                            <span className="font-semibold text-white">{eq.site_id}</span>
                          ) : (
                            <span className="text-[#64748b]">UNASSIGNED</span>
                          )}
                        </td>
                        <td className="text-right font-mono text-white font-bold text-xs">
                          {eq.engine_hours_per_day.toFixed(1)}h
                        </td>
                        <td className="text-right font-mono text-[#94a3b8] text-xs">
                          {eq.idle_hours_per_day.toFixed(1)}h
                        </td>
                        <td className="text-right font-mono text-[#ffcd11] font-bold text-xs">
                          {eq.operating_days} d
                        </td>
                        <td className="text-[#94a3b8] text-xs font-mono">
                          {eq.last_operator_id || <span className="text-[#64748b]">-</span>}
                        </td>
                        <td className="text-center">
                          <Link
                            href={`/equipment/${eq.equipment_id}/lifecycle`}
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#ffcd11] bg-[#ffcd11]/10 hover:bg-[#ffcd11]/20 border border-[#ffcd11]/30 px-2.5 py-1 rounded transition-colors uppercase tracking-wider"
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
      <div className="max-w-4xl mx-auto p-8 text-center bg-[#151a21] rounded-lg border border-red-500/40">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Fleet</h2>
        <p className="text-[#94a3b8] text-xs">Could not connect to fleet API.</p>
      </div>
    );
  }
}
