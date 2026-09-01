import { getEquipmentById, getEquipmentRentals, getUsageSummary, getUsageLogs } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, MapPin, User, Activity, AlertCircle, Wrench, CheckCircle, Fuel, PauseCircle } from "lucide-react";
import { format } from "date-fns";
import { EquipmentActions } from "@/components/equipment/EquipmentActions";
import { CheckoutForm } from "@/components/equipment/CheckoutForm";
import { CheckinForm } from "@/components/equipment/CheckinForm";

export default async function EquipmentDetailsPage({ params }: { params: Promise<{ equipmentId: string }> }) {
  try {
    const { equipmentId } = await params;
    const [eq, rentals, usageSummary, usageLogs] = await Promise.all([
      getEquipmentById(equipmentId),
      getEquipmentRentals(equipmentId),
      getUsageSummary(equipmentId),
      getUsageLogs(equipmentId)
    ]);
    const recentLogs = usageLogs.slice(0, 5);

    const utilization = (eq.engine_hours_per_day / (eq.engine_hours_per_day + eq.idle_hours_per_day)) * 100 || 0;

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/equipment" className="text-sm text-slate-400 hover:text-industrial-yellow flex items-center gap-1 w-fit transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Equipment
        </Link>
        
        {/* TOP COMMAND BAR */}
        <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white tracking-tight">{eq.equipment_id}</h1>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold border
                  ${eq.status === 'AVAILABLE' ? 'bg-transparent border-slate-500 text-slate-300' : 
                    eq.status === 'ACTIVE' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 
                    eq.status === 'OVERDUE' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 
                    'bg-orange-500/10 border-orange-500/50 text-orange-400'}`}>
                  {eq.status === 'ACTIVE' && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                  {eq.status === 'OVERDUE' && <AlertCircle className="w-3 h-3" />}
                  {eq.status === 'MAINTENANCE' && <Wrench className="w-3 h-3" />}
                  {eq.status === 'AVAILABLE' && <CheckCircle className="w-3 h-3" />}
                  {eq.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="text-industrial-yellow font-medium">{eq.equipment_type}</span>
              {eq.site_id && (
                <>
                  <span className="text-graphite-700">•</span>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{eq.site_id}</span>
                </>
              )}
            </div>
          </div>
          
          <EquipmentActions equipmentId={eq.equipment_id} status={eq.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN TELEMETRY AND STATUS - Takes 2 cols on desktop */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TELEMETRY METRICS ROW */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-graphite-900 border-l-4 border-industrial-yellow border-t border-r border-b border-graphite-700 p-4 rounded-r-md">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Engine</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-white leading-none">{eq.engine_hours_per_day.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 mb-0.5">h/day</span>
                </div>
              </div>
              <div className="bg-graphite-900 border-l-4 border-slate-600 border-t border-r border-b border-graphite-700 p-4 rounded-r-md">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Idle</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-white leading-none">{eq.idle_hours_per_day.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 mb-0.5">h/day</span>
                </div>
              </div>
              <div className="bg-graphite-900 border-l-4 border-blue-500 border-t border-r border-b border-graphite-700 p-4 rounded-r-md">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Utilization</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-white leading-none">{utilization.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 mb-0.5">%</span>
                </div>
              </div>
            </div>

            {/* STATUS PANELS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-graphite-900 border border-graphite-700 p-5 rounded-md">
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Current Location</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-graphite-800 p-2 rounded">
                    <MapPin className="h-5 w-5 text-industrial-yellow" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white">{eq.site_id || "Unassigned"}</p>
                    <p className="text-sm text-slate-500">Site ID</p>
                  </div>
                </div>
              </div>
              <div className="bg-graphite-900 border border-graphite-700 p-5 rounded-md">
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Operator</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-graphite-800 p-2 rounded">
                    <User className="h-5 w-5 text-industrial-yellow" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white">{eq.last_operator_id || "None"}</p>
                    <p className="text-sm text-slate-500">Last Operator</p>
                  </div>
                </div>
              </div>
            </div>

            {/* USAGE & FUEL */}
            <div className="bg-graphite-900 border border-graphite-700 rounded-md overflow-hidden">
              <div className="p-4 border-b border-graphite-700 bg-graphite-800">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-industrial-yellow" />
                  Usage & Fuel
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fuel Used</p>
                  <p className="text-lg font-bold text-white">{usageSummary.total_fuel_liters.toFixed(1)} <span className="text-xs text-slate-500 font-normal">L</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Operating Hours</p>
                  <p className="text-lg font-bold text-white">{usageSummary.total_operating_hours.toFixed(1)} <span className="text-xs text-slate-500 font-normal">h</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Downtime</p>
                  <p className="text-lg font-bold text-white">{usageSummary.total_downtime_hours.toFixed(1)} <span className="text-xs text-slate-500 font-normal">h</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Avg Daily Idle</p>
                  <p className="text-lg font-bold text-white">{usageSummary.avg_daily_idle_hours.toFixed(1)} <span className="text-xs text-slate-500 font-normal">h</span></p>
                </div>
              </div>
              {recentLogs.length > 0 && (
                <div className="overflow-x-auto border-t border-graphite-700">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-graphite-950/50">
                      <tr>
                        <th className="px-4 py-2 font-medium">Date</th>
                        <th className="px-4 py-2 font-medium text-right">Engine</th>
                        <th className="px-4 py-2 font-medium text-right">Idle</th>
                        <th className="px-4 py-2 font-medium text-right">Fuel</th>
                        <th className="px-4 py-2 font-medium text-right">Downtime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-700/50">
                      {recentLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-2 text-slate-400">{format(new Date(log.log_date), "MMM dd, yy")}</td>
                          <td className="px-4 py-2 text-slate-300 text-right font-mono">{log.engine_hours.toFixed(1)}h</td>
                          <td className="px-4 py-2 text-slate-300 text-right font-mono">{log.idle_hours.toFixed(1)}h</td>
                          <td className="px-4 py-2 text-slate-300 text-right font-mono">{log.fuel_used_liters.toFixed(1)}L</td>
                          <td className="px-4 py-2 text-right font-mono">
                            {log.downtime_hours > 0 ? (
                              <span className="inline-flex items-center gap-1 text-amber-400">
                                <PauseCircle className="w-3 h-3" />{log.downtime_hours.toFixed(1)}h
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RENTAL HISTORY TABLE */}
            <div className="bg-graphite-900 border border-graphite-700 rounded-md overflow-hidden">
              <div className="p-4 border-b border-graphite-700 bg-graphite-800">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-industrial-yellow" />
                  Asset Rental History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-graphite-950/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Site</th>
                      <th className="px-4 py-3 font-medium">Operator</th>
                      <th className="px-4 py-3 font-medium">Period</th>
                      <th className="px-4 py-3 font-medium text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite-700/50">
                    {rentals.length > 0 ? rentals.map((rental) => (
                      <tr key={rental.id} className="hover:bg-graphite-800/50 transition-colors">
                        <td className="px-4 py-3 text-slate-300 font-medium">{rental.site_id}</td>
                        <td className="px-4 py-3 text-slate-400">{rental.operator_id}</td>
                        <td className="px-4 py-3 text-slate-400">
                          {format(new Date(rental.checkout_time), "MMM dd, yy")} → {rental.checkin_time ? format(new Date(rental.checkin_time), "MMM dd, yy") : "Active"}
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-right">
                          {rental.rental_duration_days ? `${rental.rental_duration_days} days` : "-"}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          No rental history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Action Forms */}
          <div className="lg:col-span-1">
            <div className="bg-graphite-900 border border-graphite-700 rounded-md p-1 h-full">
              {eq.status === "AVAILABLE" ? (
                <CheckoutForm equipmentId={eq.equipment_id} />
              ) : eq.status === "ACTIVE" ? (
                <CheckinForm 
                  equipmentId={eq.equipment_id} 
                  checkoutDate={eq.checkout_date || new Date().toISOString()} 
                />
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
                  <h3 className="text-slate-300 font-medium mb-1">Cannot perform actions</h3>
                  <p className="text-slate-500 text-sm">Asset is currently {eq.status.toLowerCase()}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-graphite-900 rounded-xl shadow-sm border border-red-500/30">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Equipment Details</h2>
        <p className="text-slate-400">Equipment not found or API is unreachable.</p>
        <Link href="/equipment" className="text-industrial-yellow hover:underline mt-4 inline-block">Return to list</Link>
      </div>
    );
  }
}
