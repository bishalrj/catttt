"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, AlertTriangle, Clock, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { OverdueAlert } from "@/lib/types";

function impactText(alert: OverdueAlert): string {
  if (alert.alert_type === "OVERDUE") {
    const days = alert.days_overdue !== null ? `${alert.days_overdue}` : "an unknown number of";
    return `This asset is ${days} day(s) past its expected return date, accruing extra rental cost and blocking reallocation to another site.`;
  }
  const days = alert.days_until_due !== null ? `${alert.days_until_due}` : "a few";
  return `This asset is due back in ${days} day(s). Plan the check-in now so it doesn't slip into overdue.`;
}

function recommendationText(alert: OverdueAlert): string {
  const operator = alert.last_operator_id ?? "the assigned operator";
  if (alert.alert_type === "OVERDUE") {
    return `Contact ${operator} to confirm the return, or check the equipment back in if it's already idle on site.`;
  }
  return `Confirm with ${operator} whether the rental needs extending before the return window closes.`;
}

export function AlertRow({ alert }: { alert: OverdueAlert }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-graphite-800/50 transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-5 py-3">
          {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </td>
        <td className="px-5 py-3 font-medium">
          <Link
            href={`/equipment/${alert.equipment_id}`}
            className="text-industrial-yellow hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {alert.equipment_id}
          </Link>
        </td>
        <td className="px-5 py-3 text-slate-300">{alert.equipment_type}</td>
        <td className="px-5 py-3 text-slate-300">{alert.site_id ?? "-"}</td>
        <td className="px-5 py-3 text-slate-400">{alert.last_operator_id ?? "-"}</td>
        <td className="px-5 py-3 text-slate-300">
          {alert.expected_return_date ? (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {format(new Date(alert.expected_return_date), "MM/dd/yy HH:mm")}
            </div>
          ) : (
            "-"
          )}
        </td>
        <td className="px-5 py-3 text-slate-300 text-right font-mono">
          {alert.alert_type === "OVERDUE"
            ? alert.days_overdue !== null
              ? `+${alert.days_overdue} d`
              : "-"
            : alert.days_until_due !== null
            ? `${alert.days_until_due} d left`
            : "-"}
        </td>
        <td className="px-5 py-3 text-center">
          {alert.alert_type === "OVERDUE" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-sm">
              <AlertTriangle className="w-3 h-3" />
              OVERDUE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-sm">
              <Clock className="w-3 h-3" />
              DUE SOON
            </span>
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-graphite-950/40">
          <td colSpan={8} className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Impact</p>
                <p className="text-sm text-slate-300">{impactText(alert)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recommendation</p>
                <p className="text-sm text-slate-300">{recommendationText(alert)}</p>
              </div>
              <div className="flex md:justify-end md:items-start">
                <Link
                  href={`/equipment/${alert.equipment_id}`}
                  className="inline-flex items-center gap-2 bg-industrial-yellow hover:bg-industrial-yellow-hover text-graphite-900 font-bold py-2 px-4 rounded text-sm transition-colors"
                >
                  View Equipment <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
