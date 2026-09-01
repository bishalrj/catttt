import { getDashboardSummary, getEquipmentList } from "@/lib/api";
import { KPICards } from "@/components/dashboard/KPICards";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  try {
    const summary = await getDashboardSummary();
    const equipment = await getEquipmentList();
    const recent = equipment.slice(0, 5); // Just grab first 5 for recent

    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Overview of your rental fleet</p>
        </div>
        
        <KPICards summary={summary} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Recent Equipment</h2>
            <Link href="/equipment" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Site</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((eq) => (
                  <tr key={eq.equipment_id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <Link href={`/equipment/${eq.equipment_id}`} className="hover:underline">
                        {eq.equipment_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{eq.equipment_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${eq.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                          eq.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : 
                          eq.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {eq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{eq.site_id || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center bg-white rounded-xl shadow-sm border border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
        <p className="text-slate-600">Could not connect to the API. Ensure the backend is running.</p>
      </div>
    );
  }
}
