"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, AlertTriangle, Clock, ChevronDown, ChevronRight, ArrowRight, Cpu } from "lucide-react";
import { OverdueAlert } from "@/lib/types";

function impactText(alert: OverdueAlert): string {
  if (alert.alert_type === "OVERDUE") {
    const days = alert.days_overdue !== null ? `${alert.days_overdue}` : "an unknown number of";
    return `This asset is ${days} day(s) past expected return date, accruing additional rental expenditure and delaying machine reallocation.`;
  }
  const days = alert.days_until_due !== null ? `${alert.days_until_due}` : "a few";
  return `This asset is due back in ${days} day(s). Initiate site check-in protocol or extend rental contract.`;
}

function recommendationText(alert: OverdueAlert): string {
  const operator = alert.last_operator_id ?? "the assigned operator";
  if (alert.alert_type === "OVERDUE") {
    return `Contact operator ${operator} to confirm equipment return or process digital check-in.`;
  }
  return `Confirm with ${operator} whether the machine rental needs extension prior to milestone.`;
}

export function AlertRow({
  alert,
  onAcknowledge,
}: {
  alert: OverdueAlert;
  onAcknowledge?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-[#161b23] transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="w-8 pl-4">
          {open
            ? <ChevronDown className="w-4 h-4 text-[#ffcd11]" />
            : <ChevronRight className="w-4 h-4 text-[#5a6a7e]" />
          }
        </td>
        <td className="font-bold">
          <Link
            href={`/equipment/${alert.equipment_id}`}
            className="text-[#ffcd11] hover:underline font-mono inline-flex items-center gap-1.5 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Cpu className="w-3.5 h-3.5 text-[#5a6a7e]" />
            {alert.equipment_id}
          </Link>
        </td>
        <td className="font-bold text-white text-xs uppercase">{alert.equipment_type}</td>
        <td className="text-[#8898aa] font-mono text-xs">{alert.site_id ?? "—"}</td>
        <td className="text-[#8898aa] text-xs font-mono">{alert.last_operator_id ?? "—"}</td>
        <td className="text-[#8898aa] text-xs font-mono">
          {alert.expected_return_date ? (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#5a6a7e]" />
              {format(new Date(alert.expected_return_date), "MM/dd/yy HH:mm")}
            </div>
          ) : "—"}
        </td>
        <td className="text-right font-mono font-bold text-xs">
          {alert.alert_type === "OVERDUE" ? (
            <span className="text-red-400">
              {alert.days_overdue !== null ? `+${alert.days_overdue} d` : "—"}
            </span>
          ) : (
            <span className="text-amber-400">
              {alert.days_until_due !== null ? `${alert.days_until_due} d left` : "—"}
            </span>
          )}
        </td>
        <td className="text-center">
          {alert.alert_type === "OVERDUE" ? (
            <span className="cat-badge cat-badge-overdue">
              <AlertTriangle className="w-3 h-3" />
              OVERDUE
            </span>
          ) : (
            <span className="cat-badge cat-badge-maintenance">
              <Clock className="w-3 h-3" />
              DUE SOON
            </span>
          )}
        </td>
        <td className="text-center" onClick={(e) => e.stopPropagation()}>
          {onAcknowledge && (
            <button
              onClick={onAcknowledge}
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              Ack
            </button>
          )}
        </td>
      </tr>

      {open && (
        <tr className="bg-[#0a0c10]">
          <td colSpan={9} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 cat-row-detail">
              <div className="bg-[#131820] p-3.5 rounded-lg border border-[#21293a]">
                <p className="text-[10px] font-black text-[#5a6a7e] uppercase tracking-wider mb-1.5">Impact Analysis</p>
                <p className="text-xs text-[#e2e8f0] leading-relaxed">{impactText(alert)}</p>
              </div>
              <div className="bg-[#131820] p-3.5 rounded-lg border border-[#21293a]">
                <p className="text-[10px] font-black text-[#5a6a7e] uppercase tracking-wider mb-1.5">Recommended Action</p>
                <p className="text-xs text-[#e2e8f0] leading-relaxed">{recommendationText(alert)}</p>
              </div>
              <div className="flex md:justify-end md:items-center gap-3">
                {onAcknowledge && (
                  <button onClick={onAcknowledge} className="cat-btn-ghost text-xs">
                    Acknowledge
                  </button>
                )}
                <Link href={`/equipment/${alert.equipment_id}`} className="cat-btn-primary text-xs">
                  Manage Asset <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
