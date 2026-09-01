import { getEquipmentById, getEquipmentRentals, getUsageSummary, getUsageLogs } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, MapPin, User, Activity, AlertCircle, Wrench, CheckCircle, Fuel, PauseCircle, Gauge, Cpu, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { EquipmentActions } from "@/components/equipment/EquipmentActions";
import { CheckoutForm } from "@/components/equipment/CheckoutForm";
import { CheckinForm } from "@/components/equipment/CheckinForm";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "AVAILABLE", className: "cat-badge cat-badge-available" },
  ACTIVE: { label: "ACTIVE", className: "cat-badge cat-badge-active" },
  OVERDUE: { label: "OVERDUE", className: "cat-badge cat-badge-overdue" },
  MAINTENANCE: { label: "MAINTENANCE", className: "cat-badge cat-badge-maintenance" },
};

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
    const badge = STATUS_BADGE[eq.status] || { label: eq.status, className: "cat-badge cat-badge-low" };

    return (
      <div className="max-w-6xl mx-auto space-y-6 cat-page-enter">
        <Link href="/equipment" className="text-xs uppercase font-bold tracking-wider text-[#94a3b8] hover:text-[#ffcd11] flex items-center gap-1.5 w-fit transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Fleet Telematics
        </Link>
        
        {/* TOP COMMAND BAR */}
        <div className="cat-page-header flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">{eq.equipment_id}</h1>
              <span className={badge.className}>
                {badge.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
              <span className="font-extrabold text-[#ffcd11] uppercase">{eq.equipment_type}</span>
              {eq.site_id && (
                <>
                  <span className="text-[#323b49]">•</span>
                  <MapPin className="h-3.5 w-3.5 text-[#64748b]" />
                  <span className="font-mono font-bold text-white">{eq.site_id}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <Link
              href={`/equipment/${eq.equipment_id}/lifecycle`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffcd11] bg-[#ffcd11]/10 hover:bg-[#ffcd11]/20 border border-[#ffcd11]/30 px-3 py-2 rounded transition-colors uppercase tracking-wider"
            >
              <Activity className="w-4 h-4" />
              Lifecycle &amp; ROI
            </Link>
            <EquipmentActions equipmentId={eq.equipment_id} status={eq.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN TELEMETRY AND STATUS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TELEMETRY METRICS ROW */}
            <div className="grid grid-cols-3 gap-3.5">
              <div className="cat-card p-4 border-l-4 border-l-[#ffcd11]">
                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Engine Run</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white font-mono">{eq.engine_hours_per_day.toFixed(1)}</span>
                  <span className="text-[10px] font-mono text-[#64748b]">h/d</span>
                </div>
              </div>
              <div className="cat-card p-4 border-l-4 border-l-amber-500">
                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Idle Time</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white font-mono">{eq.idle_hours_per_day.toFixed(1)}</span>
                  <span className="text-[10px] font-mono text-[#64748b]">h/d</span>
                </div>
              </div>
              <div className="cat-card p-4 border-l-4 border-l-emerald-500">
                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Utilisation</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#ffcd11] font-mono">{utilization.toFixed(1)}</span>
                  <span className="text-[10px] font-mono text-[#64748b]">%</span>
                </div>
              </div>
            </div>

            {/* STATUS PANELS */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="cat-card p-4">
                <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Job Site Location</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-[#12161c] p-2.5 rounded border border-[#262d38] text-[#ffcd11]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white font-mono">{eq.site_id || "UNASSIGNED"}</p>
                    <p className="text-[10px] text-[#64748b] uppercase">Site ID</p>
                  </div>
                </div>
              </div>
              <div className="cat-card p-4">
                <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Operator Assignment</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-[#12161c] p-2.5 rounded border border-[#262d38] text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white font-mono">{eq.last_operator_id || "NONE"}</p>
                    <p className="text-[10px] text-[#64748b] uppercase">Last Operator</p>
                  </div>
                </div>
              </div>
            </div>

            {/* USAGE & FUEL */}
            <div className="cat-card overflow-hidden">
              <div className="px-5 py-3 border-b border-[#262d38] bg-[#11151b] flex items-center gap-2">
                <Fuel className="w-4 h-4 text-[#ffcd11]" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  VisionLink Fuel &amp; Engine Telemetry
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
                <div className="bg-[#12161c] p-3 rounded border border-[#262d38]">
                  <p className="text-[10px] font-bold text-[#64748b] uppercase mb-0.5">Fuel Burn</p>
                  <p className="text-base font-bold text-white font-mono">{usageSummary.total_fuel_liters.toFixed(1)} <span className="text-[10px] text-[#64748b]">L</span></p>
                </div>
                <div className="bg-[#12161c] p-3 rounded border border-[#262d38]">
                  <p className="text-[10px] font-bold text-[#64748b] uppercase mb-0.5">Operating Hours</p>
                  <p className="text-base font-bold text-white font-mono">{usageSummary.total_operating_hours.toFixed(1)} <span className="text-[10px] text-[#64748b]">h</span></p>
                </div>
                <div className="bg-[#12161c] p-3 rounded border border-[#262d38]">
                  <p className="text-[10px] font-bold text-[#64748b] uppercase mb-0.5">Downtime</p>
                  <p className="text-base font-bold text-white font-mono">{usageSummary.total_downtime_hours.toFixed(1)} <span className="text-[10px] text-[#64748b]">h</span></p>
                </div>
                <div className="bg-[#12161c] p-3 rounded border border-[#262d38]">
                  <p className="text-[10px] font-bold text-[#64748b] uppercase mb-0.5">Daily Idle Avg</p>
                  <p className="text-base font-bold text-white font-mono">{usageSummary.avg_daily_idle_hours.toFixed(1)} <span className="text-[10px] text-[#64748b]">h</span></p>
                </div>
              </div>
              {recentLogs.length > 0 && (
                <div className="overflow-x-auto border-t border-[#262d38]">
                  <table className="cat-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th className="text-right">Engine</th>
                        <th className="text-right">Idle</th>
                        <th className="text-right">Fuel</th>
                        <th className="text-right">Downtime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="text-xs font-mono text-[#94a3b8]">{format(new Date(log.log_date), "MMM dd, yy")}</td>
                          <td className="text-right font-mono font-bold text-white text-xs">{log.engine_hours.toFixed(1)}h</td>
                          <td className="text-right font-mono text-[#94a3b8] text-xs">{log.idle_hours.toFixed(1)}h</td>
                          <td className="text-right font-mono text-[#94a3b8] text-xs">{log.fuel_used_liters.toFixed(1)}L</td>
                          <td className="text-right font-mono text-xs">
                            {log.downtime_hours > 0 ? (
                              <span className="text-amber-400 font-bold inline-flex items-center gap-1">
                                <PauseCircle className="w-3 h-3" />{log.downtime_hours.toFixed(1)}h
                              </span>
                            ) : (
                              <span className="text-[#64748b]">-</span>
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
            <div className="cat-card overflow-hidden">
              <div className="px-5 py-3 border-b border-[#262d38] bg-[#11151b] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ffcd11]" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Asset Assignment History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="cat-table">
                  <thead>
                    <tr>
                      <th>Job Site</th>
                      <th>Operator</th>
                      <th>Assignment Period</th>
                      <th className="text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.length > 0 ? rentals.map((rental) => (
                      <tr key={rental.id}>
                        <td className="font-bold text-white font-mono text-xs">{rental.site_id}</td>
                        <td className="text-xs font-mono text-[#94a3b8]">{rental.operator_id}</td>
                        <td className="text-xs font-mono text-[#94a3b8]">
                          {format(new Date(rental.checkout_time), "MMM dd, yy")} → {rental.checkin_time ? format(new Date(rental.checkin_time), "MMM dd, yy") : "Active"}
                        </td>
                        <td className="text-right font-mono font-bold text-white text-xs">
                          {rental.rental_duration_days ? `${rental.rental_duration_days} days` : "-"}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#64748b] text-xs">
                          No assignment history found.
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
            <div className="cat-card p-5 h-full">
              {eq.status === "AVAILABLE" ? (
                <CheckoutForm equipmentId={eq.equipment_id} />
              ) : eq.status === "ACTIVE" ? (
                <CheckinForm 
                  equipmentId={eq.equipment_id} 
                  checkoutDate={eq.checkout_date || new Date().toISOString()} 
                />
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <AlertCircle className="w-10 h-10 text-[#64748b] mb-3" />
                  <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Actions Restricted</h3>
                  <p className="text-[#94a3b8] text-xs">Asset status is {eq.status.toLowerCase()}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-[#151a21] rounded-lg border border-red-500/40">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Equipment Details</h2>
        <p className="text-[#94a3b8] text-xs">Equipment not found or API is unreachable.</p>
        <Link href="/equipment" className="text-[#ffcd11] hover:underline mt-4 inline-block font-mono text-xs">Return to list</Link>
      </div>
    );
  }
}
