import { getEquipmentList } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { EquipmentRowActions } from "@/components/equipment/EquipmentRowActions";
import { Truck, Settings2, Box, Cpu } from "lucide-react";

export default async function EquipmentPage() {
  try {
    const equipment = await getEquipmentList();

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Truck className="w-6 h-6 text-industrial-yellow" /> EQUIPMENT FLEET
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Asset management and telemetry oversight</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-graphite-800 hover:bg-graphite-700 text-slate-300 border border-graphite-700 px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="bg-graphite-900 border border-graphite-700 rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-400 uppercase bg-graphite-950/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Asset ID</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Site/Location</th>
                  <th className="px-5 py-3 font-medium text-right">Engine Hrs/Day</th>
                  <th className="px-5 py-3 font-medium text-right">Idle Hrs/Day</th>
                  <th className="px-5 py-3 font-medium text-right">Op Days</th>
                  <th className="px-5 py-3 font-medium">Operator</th>
                  <th className="px-5 py-3 font-medium text-right">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/50">
                {equipment.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                      <Box className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                      No equipment fleet records found.
                    </td>
                  </tr>
                ) : (
                  equipment.map((eq) => {
                    return (
                      <tr key={eq.equipment_id} className="hover:bg-graphite-800/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-industrial-yellow">
                          <Link href={`/equipment/${eq.equipment_id}`} className="flex items-center gap-2 hover:underline">
                            <Cpu className="w-4 h-4" />
                            {eq.equipment_id}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-slate-300">{eq.equipment_type}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-sm border
                            ${eq.status === 'AVAILABLE' ? 'text-green-400 bg-green-500/10 border-green-500/30' : 
                              eq.status === 'ACTIVE' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : 
                              eq.status === 'OVERDUE' ? 'text-red-400 bg-red-500/10 border-red-500/30' : 
                              'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'}`}>
                            {eq.status === 'ACTIVE' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                            {eq.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-300">{eq.site_id || <span className="text-slate-600">-</span>}</td>
                        <td className="px-5 py-3 text-slate-300 text-right font-mono">{eq.engine_hours_per_day.toFixed(1)}</td>
                        <td className="px-5 py-3 text-slate-300 text-right font-mono">{eq.idle_hours_per_day.toFixed(1)}</td>
                        <td className="px-5 py-3 text-slate-300 text-right font-mono">{eq.operating_days}</td>
                        <td className="px-5 py-3 text-slate-400">{eq.last_operator_id || <span className="text-slate-600">-</span>}</td>
                        <td className="px-5 py-3">
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
      <div className="max-w-7xl mx-auto p-8 text-center bg-graphite-900 rounded-xl shadow-sm border border-red-500/30">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Fleet</h2>
        <p className="text-slate-400">Could not connect to fleet api.</p>
      </div>
    );
  }
}
