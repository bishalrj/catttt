import { DashboardSummary } from "@/lib/types";
import { Activity, CheckCircle2, Clock, Gauge, Truck } from "lucide-react";

interface KPICardsProps {
  summary: DashboardSummary;
}

export function KPICards({ summary }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card
        title="Total Fleet"
        value={summary.total_equipment}
        icon={<Truck className="h-5 w-5 text-rm-text-muted" />}
        badge="Assets"
        accent="text-rm-text-primary"
      />
      <Card
        title="Active On-Site"
        value={summary.active_equipment}
        icon={<Activity className="h-5 w-5 text-rm-blue" />}
        badge="Rented"
        accent="text-rm-blue"
      />
      <Card
        title="Available"
        value={summary.available_equipment}
        icon={<CheckCircle2 className="h-5 w-5 text-rm-green" />}
        badge="Ready"
        accent="text-rm-green"
      />
      <Card
        title="Overdue"
        value={summary.overdue_equipment}
        icon={<Clock className="h-5 w-5 text-rm-red" />}
        badge="Action Req."
        accent="text-rm-red"
      />
      <Card
        title="Avg Utilisation"
        value={`${summary.average_utilization}%`}
        icon={<Gauge className="h-5 w-5 text-rm-purple" />}
        badge="Fleet Run"
        accent="text-rm-purple"
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
    <div className="rm-stat-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="rm-stat-label">{title}</span>
        <div className="p-2 rounded-lg bg-rm-surface flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <span className={`rm-stat-value ${accent || "text-rm-text-primary"}`}>{value}</span>
        {badge && (
          <span className="text-[11px] font-semibold text-rm-text-muted bg-rm-surface px-2 py-0.5 rounded-full border border-rm-border-light">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
