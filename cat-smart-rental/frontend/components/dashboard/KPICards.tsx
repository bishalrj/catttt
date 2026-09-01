import { DashboardSummary } from "@/lib/types";
import { Activity, CheckCircle, Clock, Settings, Truck } from "lucide-react";

interface KPICardsProps {
  summary: DashboardSummary;
}

export function KPICards({ summary }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card
        title="Total Equipment"
        value={summary.total_equipment}
        icon={<Truck className="h-5 w-5 text-slate-500" />}
      />
      <Card
        title="Active"
        value={summary.active_equipment}
        icon={<Activity className="h-5 w-5 text-blue-400" />}
      />
      <Card
        title="Available"
        value={summary.available_equipment}
        icon={<CheckCircle className="h-5 w-5 text-green-400" />}
      />
      <Card
        title="Overdue"
        value={summary.overdue_equipment}
        icon={<Clock className="h-5 w-5 text-red-400" />}
      />
      <Card
        title="Avg Utilization"
        value={`${summary.average_utilization}%`}
        icon={<Settings className="h-5 w-5 text-industrial-yellow" />}
      />
    </div>
  );
}

function Card({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}
