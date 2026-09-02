"use client";

import { useState } from "react";
import { OverdueAlert } from "@/lib/types";
import { AlertRow } from "@/components/alerts/AlertRow";
import { Box, SortAsc, SortDesc, Filter } from "lucide-react";

type ViewMode = "table" | "timeline";

export function AlertsClient({ alerts }: { alerts: OverdueAlert[] }) {
  const [view, setView] = useState<ViewMode>("table");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [priorityFirst, setPriorityFirst] = useState(true);

  // Sort: overdue first (priority), then due_soon
  const sorted = [...alerts].sort((a, b) => {
    if (priorityFirst) {
      if (a.alert_type === "OVERDUE" && b.alert_type !== "OVERDUE") return -1;
      if (b.alert_type === "OVERDUE" && a.alert_type !== "OVERDUE") return 1;
      const ad = a.alert_type === "OVERDUE" ? (a.days_overdue ?? 0) : -(a.days_until_due ?? 0);
      const bd = b.alert_type === "OVERDUE" ? (b.days_overdue ?? 0) : -(b.days_until_due ?? 0);
      return bd - ad;
    }
    return 0;
  });

  const visible = sorted.filter((a) => !acknowledged.has(a.equipment_id));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPriorityFirst((p) => !p)}
            className={`cat-btn-ghost text-xs flex items-center gap-1.5 ${priorityFirst ? "text-[#ffcd11] border-[#ffcd11]/40" : ""}`}
          >
            {priorityFirst ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
            {priorityFirst ? "Priority First" : "Default Sort"}
          </button>
          <span className="text-[11px] font-mono text-[#5a6a7e]">
            {visible.length} of {alerts.length} alerts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("table")}
            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
              view === "table"
                ? "bg-[#ffcd11]/15 border-[#ffcd11]/40 text-[#ffcd11]"
                : "bg-[#131820] border-[#21293a] text-[#5a6a7e] hover:text-white"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
              view === "timeline"
                ? "bg-[#ffcd11]/15 border-[#ffcd11]/40 text-[#ffcd11]"
                : "bg-[#131820] border-[#21293a] text-[#5a6a7e] hover:text-white"
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Acknowledged notice */}
      {acknowledged.size > 0 && (
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-4 py-2.5">
          <span className="text-xs text-emerald-400 font-semibold">
            {acknowledged.size} alert{acknowledged.size > 1 ? "s" : ""} acknowledged
          </span>
          <button
            onClick={() => setAcknowledged(new Set())}
            className="text-[10px] text-emerald-400 hover:text-white underline"
          >
            Restore all
          </button>
        </div>
      )}

      {view === "table" ? (
        <div className="cat-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cat-table cat-table-sticky">
              <thead>
                <tr>
                  <th className="w-8" />
                  <th>Asset ID</th>
                  <th>Machine Model</th>
                  <th>Job Site</th>
                  <th>Operator</th>
                  <th>Expected Return</th>
                  <th className="text-right">Timeline Delta</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-[#5a6a7e]">
                      <Box className="w-8 h-8 mx-auto mb-3 text-[#2d3848]" />
                      <p className="font-medium text-white mb-1">All Clear</p>
                      <p className="text-sm">No outstanding alerts. Fleet operating on schedule.</p>
                    </td>
                  </tr>
                ) : (
                  visible.map((alert) => (
                    <AlertRow
                      key={alert.equipment_id}
                      alert={alert}
                      onAcknowledge={() => setAcknowledged((s) => new Set([...s, alert.equipment_id]))}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-3">
          {visible.length === 0 ? (
            <div className="cat-card p-12 text-center text-[#5a6a7e]">
              <Box className="w-8 h-8 mx-auto mb-3 text-[#2d3848]" />
              <p>No alerts to display.</p>
            </div>
          ) : (
            visible.map((alert, idx) => {
              const isOverdue = alert.alert_type === "OVERDUE";
              const accentColor = isOverdue ? "#ef4444" : "#f59e0b";
              return (
                <div
                  key={alert.equipment_id}
                  className="cat-card p-5 flex items-start gap-4 cat-fade-in"
                  style={{
                    borderLeft: `3px solid ${accentColor}`,
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  <div className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 font-black text-xs"
                    style={{ background: `${accentColor}15`, borderColor: `${accentColor}30`, color: accentColor }}>
                    {isOverdue ? "!" : "~"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-white text-sm">{alert.equipment_id}</span>
                      <span className="text-xs font-bold text-[#8898aa] uppercase">{alert.equipment_type}</span>
                      <span className={`cat-badge ${isOverdue ? "cat-badge-overdue" : "cat-badge-maintenance"} text-[10px]`}>
                        {isOverdue ? `OVERDUE +${alert.days_overdue ?? "?"}d` : `DUE IN ${alert.days_until_due ?? "?"}d`}
                      </span>
                    </div>
                    <p className="text-xs text-[#8898aa] mt-1">
                      Site: <span className="text-white font-mono">{alert.site_id ?? "—"}</span> ·
                      Operator: <span className="text-white font-mono">{alert.last_operator_id ?? "—"}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setAcknowledged((s) => new Set([...s, alert.equipment_id]))}
                    className="cat-btn-ghost text-[10px] shrink-0"
                  >
                    Acknowledge
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
