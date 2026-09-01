import { getRentals } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { Box, Calendar, Truck } from "lucide-react";

export default async function RentalsPage() {
  try {
    const rentals = await getRentals();

    return (
      <div className="max-w-7xl mx-auto space-y-8 cat-page-enter">
        {/* Header */}
        <div className="cat-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="cat-section-heading text-xl">
              Rental <span className="accent">Operations</span>
            </h1>
            <p className="text-[#94a3b8] text-xs sm:text-sm mt-1">
              Historical equipment deployments, checkout telemetry, and active field assignments
            </p>
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-[#ffcd11] bg-[#12161c] px-3.5 py-2 rounded border border-[#262d38]">
              {rentals.length} OPERATIONS LOGGED
            </span>
          </div>
        </div>

        {/* Table Card */}
        <div className="cat-card overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Job Site</th>
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
                    <td colSpan={9} className="py-16 text-center text-[#64748b]">
                      <Box className="w-8 h-8 mx-auto mb-2 text-[#323b49]" />
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
                          <Link href={`/equipment/${rental.equipment_id}`} className="text-[#ffcd11] hover:underline font-mono inline-flex items-center gap-1.5 text-xs">
                            <Truck className="w-3.5 h-3.5 text-[#64748b]" />
                            {rental.equipment_id}
                          </Link>
                        </td>
                        <td className="font-bold text-white font-mono text-xs">{rental.site_id}</td>
                        <td className="text-[#94a3b8] text-xs font-mono">{rental.operator_id}</td>
                        <td className="text-[#94a3b8] text-xs font-mono">
                          {rental.checkout_time ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                              {format(new Date(rental.checkout_time), "MM/dd/yy HH:mm")}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="text-[#94a3b8] text-xs font-mono">
                          {rental.checkin_time ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                              {format(new Date(rental.checkin_time), "MM/dd/yy HH:mm")}
                            </div>
                          ) : (
                            <span className="text-[#34d399] font-bold">OPERATIONAL</span>
                          )}
                        </td>
                        <td className="text-white text-right font-mono font-bold text-xs">
                          {rental.rental_duration_days !== null ? `${rental.rental_duration_days} d` : "-"}
                        </td>
                        <td className="text-[#ffcd11] text-right font-mono font-bold text-xs">
                          {runtime !== "-" ? `${runtime} h` : "-"}
                        </td>
                        <td className="text-[#94a3b8] text-right font-mono text-xs">
                          {rental.idle_hours !== null ? `${rental.idle_hours} h` : "-"}
                        </td>
                        <td className="text-center">
                          {isActive ? (
                            <span className="cat-badge cat-badge-active">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="cat-badge cat-badge-available">
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
      <div className="max-w-4xl mx-auto p-10 text-center bg-[#151a21] rounded-lg border border-red-500/40">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Operations</h2>
        <p className="text-[#94a3b8] text-xs">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
