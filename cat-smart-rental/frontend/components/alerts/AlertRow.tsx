"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, AlertTriangle, Clock, ChevronDown, ChevronRight, ArrowRight, Cpu } from "lucide-react";
import { OverdueAlert } from "@/lib/types";

function impactText(alert: OverdueAlert): string {
  if (alert.alert_type === "OVERDUE") {
    const days = alert.days_overdue !== null ? `${alert.days_overdue}` : "an unknown number of";
    return `This asset is ${days} day(s) past its expected return date, accruing extra rental cost and blocking reallocation to another site.`;
  }
  const days = alert.days_until_due !== null ? `${alert.days_until_due}` : "a few";
  return `This asset is due back in ${days} day(s). Plan the check-in now so it doesn't slip into overdue status.`;
}

function recommendationText(alert: OverdueAlert): string {
  const operator = alert.last_operator_id ?? "the assigned operator";
  if (alert.alert_type === "OVERDUE") {
    return `Contact ${operator} to confirm return or check in if idle on site.`;
  }
  return `Confirm with ${operator} whether the rental needs extending before the return window closes.`;
}

export function AlertRow({ alert }: { alert: OverdueAlert }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-slate-50 transition-colors cursor-pointer border-b border-rm-border-light"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="w-8 pl-4">
          {open ? <ChevronDown className="w-4 h-4 text-rm-text-muted" /> : <ChevronRight className="w-4 h-4 text-rm-text-muted" />}
        </td>
        <td className="font-bold">
          <Link
            href={`/equipment/${alert.equipment_id}`}
            className="text-rm-red hover:underline font-mono inline-flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Cpu className="w-3.5 h-3.5 text-rm-text-muted" />
            {alert.equipment_id}
          </Link>
        </td>
        <td className="font-medium text-rm-text-primary">{alert.equipment_type}</td>
        <td className="text-rm-text-secondary">{alert.site_id ?? "-"}</td>
        <td className="text-rm-text-secondary text-xs">{alert.last_operator_id ?? "-"}</td>
        <td className="text-rm-text-secondary text-xs">
          {alert.expected_return_date ? (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rm-text-muted" />
              {format(new Date(alert.expected_return_date), "MM/dd/yy HH:mm")}
            </div>
          ) : (
            "-"
          )}
        </td>
        <td className="text-right font-mono font-semibold">
          {alert.alert_type === "OVERDUE" ? (
            <span className="text-rm-red font-bold">
              {alert.days_overdue !== null ? `+${alert.days_overdue} d` : "-"}
            </span>
          ) : (
            <span className="text-amber-600 font-bold">
              {alert.days_until_due !== null ? `${alert.days_until_due} d left` : "-"}
            </span>
          )}
        </td>
        <td className="text-center">
          {alert.alert_type === "OVERDUE" ? (
            <span className="rm-badge rm-badge-overdue">
              <AlertTriangle className="w-3 h-3" />
              OVERDUE
            </span>
          ) : (
            <span className="rm-badge rm-badge-maintenance">
              <Clock className="w-3 h-3" />
              DUE SOON
            </span>
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-50">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3.5 rounded-lg border border-rm-border">
                <p className="text-[11px] font-bold text-rm-text-muted uppercase tracking-wider mb-1">Impact Analysis</p>
                <p className="text-xs text-rm-text-primary leading-relaxed">{impactText(alert)}</p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-rm-border">
                <p className="text-[11px] font-bold text-rm-text-muted uppercase tracking-wider mb-1">Recommended Action</p>
                <p className="text-xs text-rm-text-primary leading-relaxed">{recommendationText(alert)}</p>
              </div>
              <div className="flex md:justify-end md:items-center">
                <Link
                  href={`/equipment/${alert.equipment_id}`}
                  className="rm-btn-primary text-xs"
                >
                  Manage Equipment <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
