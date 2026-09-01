import { getRentals } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, Activity, Box, Calendar, Truck } from "lucide-react";

export default async function RentalsPage() {
  try {
    const rentals = await getRentals();

    return (
      <div className="max-w-7xl mx-auto space-y-6 rm-page-enter">
        {/* Header */}
        <div className="rm-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="rm-section-heading text-2xl">
              Rental <span className="accent">Operations</span>
            </h1>
            <p className="text-rm-text-secondary text-sm mt-1">
              Historical equipment movements, site checkout logs, and active field assignments
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-rm-text-muted bg-rm-surface px-3 py-1.5 rounded-lg border border-rm-border">
              {rentals.length} Operations Recorded
            </span>
          </div>
        </div>

        {/* Table Card */}
        <div className="rm-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="rm-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Site Location</th>
                  <th>Operator</th>
                  <th>Check-Out</th>
                  <th>Check-In</th>
                  <th className="text-right">Duration</th>
                  <th className="text-right">Runtime</th>
                  <th className="text-right">Idle Time</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {rentals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-rm-text-muted">
                      <Box className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No rental operations found.
                    </td>
                  </tr>
                ) : (
                  rentals.map((rental) => {
                    const isActive = rental.checkin_time === null;
                    const runtime = rental.engine_hours_end !== null 
                      ? (rental.engine_hours_end - rental.engine_hours_start).toFixed(1) 
                      : "-";
                    
                    return (
                      <tr key={rental.id}>
                        <td className="font-bold">
                          <Link href={`/equipment/${rental.equipment_id}`} className="text-rm-red hover:underline font-mono inline-flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-rm-text-muted" />
                            {rental.equipment_id}
                          </Link>
                        </td>
                        <td className="font-medium text-rm-text-primary">{rental.site_id}</td>
                        <td className="text-rm-text-secondary text-xs">{rental.operator_id}</td>
                        <td className="text-rm-text-secondary text-xs">
                          {rental.checkout_time ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-rm-text-muted" />
                              {format(new Date(rental.checkout_time), "MM/dd/yy HH:mm")}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="text-rm-text-secondary text-xs">
                          {rental.checkin_time ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-rm-text-muted" />
                              {format(new Date(rental.checkin_time), "MM/dd/yy HH:mm")}
                            </div>
                          ) : (
                            <span className="text-rm-green font-semibold">Active in Field</span>
                          )}
                        </td>
                        <td className="text-rm-text-primary text-right font-mono font-medium">
                          {rental.rental_duration_days !== null ? `${rental.rental_duration_days} d` : "-"}
                        </td>
                        <td className="text-rm-text-primary text-right font-mono font-semibold">
                          {runtime !== "-" ? `${runtime} h` : "-"}
                        </td>
                        <td className="text-rm-text-secondary text-right font-mono">
                          {rental.idle_hours !== null ? `${rental.idle_hours} h` : "-"}
                        </td>
                        <td className="text-center">
                          {isActive ? (
                            <span className="rm-badge rm-badge-active">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="rm-badge rm-badge-available">
                              COMPLETED
                            </span>
                          )}
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
        <h2 className="text-xl font-bold text-rm-red mb-2">Error Loading Operations</h2>
        <p className="text-rm-text-secondary text-sm">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
