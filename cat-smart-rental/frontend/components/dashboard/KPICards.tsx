import { DashboardSummary } from "@/lib/types";
import { Activity, CheckCircle2, Clock, Gauge, Truck } from "lucide-react";

interface KPICardsProps {
  summary: DashboardSummary;
}

export function KPICards({ summary }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <Card
        title="Total Cat Fleet"
        value={summary.total_equipment}
        icon={<Truck className="h-4 w-4 text-[#ffcd11]" />}
        badge="ASSETS"
        accent="text-[#f8fafc]"
      />
      <Card
        title="Active On-Site"
        value={summary.active_equipment}
        icon={<Activity className="h-4 w-4 text-[#38bdf8]" />}
        badge="OPERATIONAL"
        accent="text-[#38bdf8]"
      />
      <Card
        title="Available"
        value={summary.available_equipment}
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        badge="READY"
        accent="text-emerald-400"
      />
      <Card
        title="Overdue"
        value={summary.overdue_equipment}
        icon={<Clock className="h-4 w-4 text-red-400" />}
        badge="ATTN REQ"
        accent="text-red-400"
      />
      <Card
        title="Avg Utilisation"
        value={`${summary.average_utilization}%`}
        icon={<Gauge className="h-4 w-4 text-[#ffcd11]" />}
        badge="RUNTIME"
        accent="text-[#ffcd11]"
      />
    </div>
  );
}

function Card({
  title,
  value,
  icon,
  badge,
  accent,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  badge?: string;
  accent?: string;
}) {
  return (
    <div className="cat-stat-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="cat-stat-label">{title}</span>
        <div className="p-1.5 rounded bg-[#12161c] border border-[#262d38]">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <span className={`cat-stat-value ${accent || "text-white"}`}>{value}</span>
        {badge && (
          <span className="text-[10px] font-extrabold tracking-wider text-[#64748b] bg-[#12161c] px-2 py-0.5 rounded border border-[#262d38]">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
