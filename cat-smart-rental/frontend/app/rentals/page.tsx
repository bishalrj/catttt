import { getRentals } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, Activity, Settings2, Box, Calendar } from "lucide-react";

export default async function RentalsPage() {
  try {
    const rentals = await getRentals();

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-industrial-yellow" /> RENTAL OPERATIONS
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Historical equipment movements and active rentals</p>
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
                  <th className="px-5 py-3 font-medium">Asset</th>
                  <th className="px-5 py-3 font-medium">Site</th>
                  <th className="px-5 py-3 font-medium">Operator</th>
                  <th className="px-5 py-3 font-medium">Check-Out</th>
                  <th className="px-5 py-3 font-medium">Check-In</th>
                  <th className="px-5 py-3 font-medium text-right">Duration</th>
                  <th className="px-5 py-3 font-medium text-right">Runtime</th>
                  <th className="px-5 py-3 font-medium text-right">Idle</th>
                  <th className="px-5 py-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/50">
                {rentals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                      <Box className="w-8 h-8 mx-auto mb-3 text-slate-600" />
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
                      <tr key={rental.id} className="hover:bg-graphite-800/50 transition-colors">
                        <td className="px-5 py-3 font-medium">
                          <Link href={`/equipment/${rental.equipment_id}`} className="text-industrial-yellow hover:underline">
                            {rental.equipment_id}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-slate-300">{rental.site_id}</td>
                        <td className="px-5 py-3 text-slate-400">{rental.operator_id}</td>
                        <td className="px-5 py-3 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {format(new Date(rental.checkout_time), "MM/dd/yy HH:mm")}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-300">
                          {rental.checkin_time ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {format(new Date(rental.checkin_time), "MM/dd/yy HH:mm")}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Active</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-300 text-right font-mono">
                          {rental.rental_duration_days !== null ? `${rental.rental_duration_days} d` : "-"}
                        </td>
                        <td className="px-5 py-3 text-slate-300 text-right font-mono">
                          {runtime !== "-" ? `${runtime} h` : "-"}
                        </td>
                        <td className="px-5 py-3 text-slate-300 text-right font-mono">
                          {rental.idle_hours !== null ? `${rental.idle_hours} h` : "-"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 border border-slate-700 px-2 py-0.5 rounded-sm">
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
      <div className="max-w-7xl mx-auto p-8 text-center bg-graphite-900 rounded-xl shadow-sm border border-red-500/30">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Operations</h2>
        <p className="text-slate-400">Could not connect to telemetry feed.</p>
      </div>
    );
  }
}
