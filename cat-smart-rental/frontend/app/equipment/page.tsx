import { getEquipmentList } from "@/lib/api";
import { Box, Activity, Truck } from "lucide-react";
import { EquipmentTable } from "@/components/equipment/EquipmentTable";

export default async function EquipmentPage() {
  let equipment;
  try {
    equipment = await getEquipmentList();
  } catch {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 text-center bg-[#131820] rounded-xl border border-red-500/30">
        <Activity className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Fleet Data Offline</h2>
        <p className="text-[#8898aa] text-sm">Could not connect to fleet API.</p>
      </div>
    );
  }

  const activeCount  = equipment.filter((e) => e.status === "ACTIVE").length;
  const overdueCount = equipment.filter((e) => e.status === "OVERDUE").length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 cat-page-enter">
      {/* Header */}
      <div className="cat-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="cat-section-heading text-xl">
            Cat Fleet <span className="accent">Telematics</span>
          </h1>
          <p className="text-[#8898aa] text-sm mt-1">
            Industrial machinery telemetry, operational statuses, and lifecycle command oversight
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <span className="cat-badge cat-badge-available text-xs px-3 py-1.5">
            <Truck className="w-3 h-3 inline mr-1" />
            {equipment.length} TOTAL ASSETS
          </span>
          <span className="cat-badge cat-badge-low text-xs px-3 py-1.5">
            <Activity className="w-3 h-3 inline mr-1" />
            {activeCount} ACTIVE
          </span>
          {overdueCount > 0 && (
            <span className="cat-badge cat-badge-overdue text-xs px-3 py-1.5">
              {overdueCount} OVERDUE
            </span>
          )}
        </div>
      </div>

      {/* Interactive table */}
      <EquipmentTable equipment={equipment} />
    </div>
  );
}
