import { getEquipmentById, getEquipmentRentals, getUsageSummary, getUsageLogs } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, MapPin, User, Activity, AlertCircle, Wrench, CheckCircle, Fuel, PauseCircle, Gauge, Cpu, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { EquipmentActions } from "@/components/equipment/EquipmentActions";
import { CheckoutForm } from "@/components/equipment/CheckoutForm";
import { CheckinForm } from "@/components/equipment/CheckinForm";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "rm-badge rm-badge-available" },
  ACTIVE: { label: "Active", className: "rm-badge rm-badge-active" },
  OVERDUE: { label: "Overdue", className: "rm-badge rm-badge-overdue" },
  MAINTENANCE: { label: "Maintenance", className: "rm-badge rm-badge-maintenance" },
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
    const badge = STATUS_BADGE[eq.status] || { label: eq.status, className: "rm-badge rm-badge-low" };

    return (
      <div className="max-w-6xl mx-auto space-y-6 rm-page-enter">
        <Link href="/equipment" className="text-sm font-semibold text-rm-text-secondary hover:text-rm-red flex items-center gap-1.5 w-fit transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Equipment Catalog
        </Link>
        
        {/* TOP COMMAND BAR */}
        <div className="rm-page-header flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-rm-text-primary tracking-tight font-mono">{eq.equipment_id}</h1>
              <span className={badge.className}>
                {badge.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-rm-text-secondary">
              <span className="font-bold text-rm-red">{eq.equipment_type}</span>
              {eq.site_id && (
                <>
                  <span className="text-rm-border">•</span>
                  <MapPin className="h-3.5 w-3.5 text-rm-text-muted" />
                  <span className="font-semibold text-rm-text-primary">{eq.site_id}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <Link
              href={`/equipment/${eq.equipment_id}/lifecycle`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rm-purple bg-rm-purple-light hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-lg transition-colors"
            >
              <Activity className="w-4 h-4" />
              View Lifecycle &amp; ROI
            </Link>
            <EquipmentActions equipmentId={eq.equipment_id} status={eq.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN TELEMETRY AND STATUS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TELEMETRY METRICS ROW */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rm-card p-4 border-l-4 border-l-rm-red">
                <p className="text-[11px] font-bold text-rm-text-muted uppercase tracking-wider mb-1">Engine Run</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-rm-text-primary">{eq.engine_hours_per_day.toFixed(1)}</span>
                  <span className="text-xs text-rm-text-muted">h/day</span>
                </div>
              </div>
              <div className="rm-card p-4 border-l-4 border-l-amber-500">
                <p className="text-[11px] font-bold text-rm-text-muted uppercase tracking-wider mb-1">Idle Time</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-rm-text-primary">{eq.idle_hours_per_day.toFixed(1)}</span>
                  <span className="text-xs text-rm-text-muted">h/day</span>
                </div>
              </div>
              <div className="rm-card p-4 border-l-4 border-l-rm-green">
                <p className="text-[11px] font-bold text-rm-text-muted uppercase tracking-wider mb-1">Utilisation</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-rm-text-primary">{utilization.toFixed(1)}</span>
                  <span className="text-xs text-rm-text-muted">%</span>
                </div>
              </div>
            </div>

            {/* STATUS PANELS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rm-card p-5">
                <h3 className="text-[11px] font-bold text-rm-text-muted uppercase tracking-wider mb-3">Current Location</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2.5 rounded-xl text-rm-red">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-rm-text-primary">{eq.site_id || "Unassigned"}</p>
                    <p className="text-xs text-rm-text-muted">Site Location ID</p>
                  </div>
                </div>
              </div>
              <div className="rm-card p-5">
                <h3 className="text-[11px] font-bold text-rm-text-muted uppercase tracking-wider mb-3">Operator Assignment</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-rm-text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-rm-text-primary">{eq.last_operator_id || "None"}</p>
                    <p className="text-xs text-rm-text-muted">Last Operator ID</p>
                  </div>
                </div>
              </div>
            </div>

            {/* USAGE & FUEL */}
            <div className="rm-card overflow-hidden">
              <div className="px-6 py-4 border-b border-rm-border bg-slate-50 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-rm-red" />
                <h3 className="text-xs font-bold text-rm-text-secondary uppercase tracking-wider">
                  Usage Summary &amp; Fuel Telemetry
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
                <div className="bg-slate-50 p-3 rounded-xl border border-rm-border-light">
                  <p className="text-[11px] font-semibold text-rm-text-muted mb-0.5">Fuel Used</p>
                  <p className="text-base font-bold text-rm-text-primary">{usageSummary.total_fuel_liters.toFixed(1)} <span className="text-xs font-normal text-rm-text-muted">L</span></p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-rm-border-light">
                  <p className="text-[11px] font-semibold text-rm-text-muted mb-0.5">Operating Hours</p>
                  <p className="text-base font-bold text-rm-text-primary">{usageSummary.total_operating_hours.toFixed(1)} <span className="text-xs font-normal text-rm-text-muted">h</span></p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-rm-border-light">
                  <p className="text-[11px] font-semibold text-rm-text-muted mb-0.5">Downtime</p>
                  <p className="text-base font-bold text-rm-text-primary">{usageSummary.total_downtime_hours.toFixed(1)} <span className="text-xs font-normal text-rm-text-muted">h</span></p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-rm-border-light">
                  <p className="text-[11px] font-semibold text-rm-text-muted mb-0.5">Avg Daily Idle</p>
                  <p className="text-base font-bold text-rm-text-primary">{usageSummary.avg_daily_idle_hours.toFixed(1)} <span className="text-xs font-normal text-rm-text-muted">h</span></p>
                </div>
              </div>
              {recentLogs.length > 0 && (
                <div className="overflow-x-auto border-t border-rm-border-light">
                  <table className="rm-table">
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
                          <td className="text-xs text-rm-text-secondary">{format(new Date(log.log_date), "MMM dd, yy")}</td>
                          <td className="text-right font-mono font-semibold text-rm-text-primary">{log.engine_hours.toFixed(1)}h</td>
                          <td className="text-right font-mono text-rm-text-secondary">{log.idle_hours.toFixed(1)}h</td>
                          <td className="text-right font-mono text-rm-text-secondary">{log.fuel_used_liters.toFixed(1)}L</td>
                          <td className="text-right font-mono">
                            {log.downtime_hours > 0 ? (
                              <span className="text-amber-600 font-bold inline-flex items-center gap-1">
                                <PauseCircle className="w-3 h-3" />{log.downtime_hours.toFixed(1)}h
                              </span>
                            ) : (
                              <span className="text-rm-text-muted">-</span>
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
            <div className="rm-card overflow-hidden">
              <div className="px-6 py-4 border-b border-rm-border bg-slate-50 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rm-red" />
                <h3 className="text-xs font-bold text-rm-text-secondary uppercase tracking-wider">
                  Asset Rental History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="rm-table">
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th>Operator</th>
                      <th>Period</th>
                      <th className="text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.length > 0 ? rentals.map((rental) => (
                      <tr key={rental.id}>
                        <td className="font-bold text-rm-text-primary">{rental.site_id}</td>
                        <td className="text-xs text-rm-text-secondary">{rental.operator_id}</td>
                        <td className="text-xs text-rm-text-secondary">
                          {format(new Date(rental.checkout_time), "MMM dd, yy")} → {rental.checkin_time ? format(new Date(rental.checkin_time), "MMM dd, yy") : "Active"}
                        </td>
                        <td className="text-right font-mono font-medium text-rm-text-primary">
                          {rental.rental_duration_days ? `${rental.rental_duration_days} days` : "-"}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-rm-text-muted">
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
            <div className="rm-card p-5 h-full">
              {eq.status === "AVAILABLE" ? (
                <CheckoutForm equipmentId={eq.equipment_id} />
              ) : eq.status === "ACTIVE" ? (
                <CheckinForm 
                  equipmentId={eq.equipment_id} 
                  checkoutDate={eq.checkout_date || new Date().toISOString()} 
                />
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-rm-text-primary font-bold mb-1">Actions Unavailable</h3>
                  <p className="text-rm-text-secondary text-xs">Asset is currently {eq.status.toLowerCase()}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-red-200">
        <h2 className="text-xl font-bold text-rm-red mb-2">Error Loading Equipment Details</h2>
        <p className="text-rm-text-secondary text-sm">Equipment not found or API is unreachable.</p>
        <Link href="/equipment" className="text-rm-red hover:underline mt-4 inline-block font-semibold text-sm">Return to list</Link>
      </div>
    );
  }
}
