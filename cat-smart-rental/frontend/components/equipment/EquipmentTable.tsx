"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EquipmentRowActions } from "@/components/equipment/EquipmentRowActions";
import {
  Truck, Box, Cpu, Activity, Search, Filter,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
  MapPin, Clock, Gauge, User,
} from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  AVAILABLE:   { label: "AVAILABLE",   className: "cat-badge cat-badge-available" },
  ACTIVE:      { label: "ACTIVE",      className: "cat-badge cat-badge-active" },
  OVERDUE:     { label: "OVERDUE",     className: "cat-badge cat-badge-overdue" },
  MAINTENANCE: { label: "MAINTENANCE", className: "cat-badge cat-badge-maintenance" },
};

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: "#10b981",
  ACTIVE: "#ffcd11",
  OVERDUE: "#ef4444",
  MAINTENANCE: "#f59e0b",
};

type SortKey = "equipment_id" | "equipment_type" | "status" | "engine_hours_per_day" | "idle_hours_per_day" | "operating_days";
type SortDir = "asc" | "desc";

interface Equipment {
  equipment_id: string;
  equipment_type: string;
  status: string;
  site_id: string | null;
  engine_hours_per_day: number;
  idle_hours_per_day: number;
  operating_days: number;
  last_operator_id: string | null;
}

export function EquipmentTable({ equipment }: { equipment: Equipment[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("equipment_id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = equipment;
    if (statusFilter !== "ALL") list = list.filter((e) => e.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.equipment_id.toLowerCase().includes(q) ||
          e.equipment_type.toLowerCase().includes(q) ||
          (e.site_id ?? "").toLowerCase().includes(q) ||
          (e.last_operator_id ?? "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [equipment, search, statusFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3 h-3 text-[#ffcd11]" />
      : <ArrowDown className="w-3 h-3 text-[#ffcd11]" />;
  }

  const statuses = ["ALL", ...Array.from(new Set(equipment.map((e) => e.status)))];

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#131820] border border-[#21293a] rounded-lg px-3 py-2 flex-1 max-w-sm focus-within:border-[#ffcd11]/50 transition-all">
          <Search className="w-3.5 h-3.5 text-[#5a6a7e] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets, sites, operators…"
            className="bg-transparent text-xs text-[#f8fafc] placeholder-[#5a6a7e] outline-none flex-1"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#5a6a7e] hover:text-white text-xs transition-colors">
              ✕
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#5a6a7e]" />
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-all ${
                statusFilter === s
                  ? "bg-[#ffcd11]/15 border-[#ffcd11]/40 text-[#ffcd11]"
                  : "bg-[#131820] border-[#21293a] text-[#5a6a7e] hover:border-[#2d3848] hover:text-white"
              }`}
            >
              {s}
              {s !== "ALL" && (
                <span className="ml-1 text-[9px]">
                  ({equipment.filter((e) => e.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Result count */}
        <div className="ml-auto flex items-center gap-2 text-xs font-mono text-[#5a6a7e] shrink-0">
          <span className="text-[#ffcd11] font-bold">{filtered.length}</span>
          <span>/ {equipment.length} assets</span>
        </div>
      </div>

      {/* Table */}
      <div className="cat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cat-table cat-table-sticky">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort("equipment_id")}>
                  <span className="flex items-center gap-1.5">Asset ID <SortIcon col="equipment_id" /></span>
                </th>
                <th className="sortable" onClick={() => handleSort("equipment_type")}>
                  <span className="flex items-center gap-1.5">Machine Type <SortIcon col="equipment_type" /></span>
                </th>
                <th className="sortable" onClick={() => handleSort("status")}>
                  <span className="flex items-center gap-1.5">Status <SortIcon col="status" /></span>
                </th>
                <th>Job Site</th>
                <th className="text-right sortable" onClick={() => handleSort("engine_hours_per_day")}>
                  <span className="flex items-center justify-end gap-1.5">Engine h/d <SortIcon col="engine_hours_per_day" /></span>
                </th>
                <th className="text-right sortable" onClick={() => handleSort("idle_hours_per_day")}>
                  <span className="flex items-center justify-end gap-1.5">Idle h/d <SortIcon col="idle_hours_per_day" /></span>
                </th>
                <th className="text-right sortable" onClick={() => handleSort("operating_days")}>
                  <span className="flex items-center justify-end gap-1.5">Days <SortIcon col="operating_days" /></span>
                </th>
                <th>Operator</th>
                <th className="text-center">ROI</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-[#5a6a7e]">
                    <Box className="w-8 h-8 mx-auto mb-3 text-[#2d3848]" />
                    <p className="font-medium">No assets match your filter.</p>
                    <button
                      onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                      className="mt-2 text-[#ffcd11] text-xs hover:underline"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((eq) => {
                  const badge = STATUS_BADGE[eq.status] ?? { label: eq.status, className: "cat-badge cat-badge-low" };
                  const barColor = STATUS_COLOR[eq.status] ?? "#5a6a7e";
                  const isExpanded = expandedRow === eq.equipment_id;
                  const idleRatio = eq.engine_hours_per_day > 0
                    ? (eq.idle_hours_per_day / eq.engine_hours_per_day) * 100
                    : 0;

                  return (
                    <>
                      <tr
                        key={eq.equipment_id}
                        className="cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : eq.equipment_id)}
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 rounded-full shrink-0" style={{ background: barColor }} />
                            <Link
                              href={`/equipment/${eq.equipment_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#ffcd11] hover:underline inline-flex items-center gap-1.5 font-mono text-xs font-bold"
                            >
                              <Cpu className="w-3 h-3 text-[#5a6a7e]" />
                              {eq.equipment_id}
                            </Link>
                          </div>
                        </td>
                        <td className="font-bold text-white uppercase text-xs">{eq.equipment_type}</td>
                        <td><span className={badge.className}>{badge.label}</span></td>
                        <td className="font-mono text-xs">
                          {eq.site_id ? (
                            <span className="flex items-center gap-1 text-white">
                              <MapPin className="w-3 h-3 text-[#5a6a7e]" />{eq.site_id}
                            </span>
                          ) : (
                            <span className="text-[#5a6a7e]">—</span>
                          )}
                        </td>
                        <td className="text-right font-mono text-white font-bold text-xs">{eq.engine_hours_per_day.toFixed(1)}h</td>
                        <td className="text-right font-mono text-xs">
                          <span className={idleRatio > 50 ? "text-amber-400 font-bold" : "text-[#8898aa]"}>
                            {eq.idle_hours_per_day.toFixed(1)}h
                          </span>
                        </td>
                        <td className="text-right font-mono text-[#ffcd11] font-bold text-xs">{eq.operating_days}d</td>
                        <td className="font-mono text-xs text-[#8898aa]">{eq.last_operator_id || <span className="text-[#5a6a7e]">—</span>}</td>
                        <td className="text-center">
                          <Link
                            href={`/equipment/${eq.equipment_id}/lifecycle`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#ffcd11] bg-[#ffcd11]/10 hover:bg-[#ffcd11]/20 border border-[#ffcd11]/25 px-2.5 py-1 rounded-lg transition-colors uppercase tracking-wider"
                          >
                            <Activity className="w-3 h-3" /> ROI
                          </Link>
                        </td>
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <EquipmentRowActions equipmentId={eq.equipment_id} status={eq.status} />
                            <button className="cat-btn-icon" title={isExpanded ? "Collapse" : "Expand"}>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr key={`${eq.equipment_id}-detail`}>
                          <td colSpan={10} className="p-0">
                            <div className="cat-row-detail bg-[#0d1117]/80 border-t border-[#21293a] px-6 py-5">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-[#5a6a7e] uppercase tracking-wider flex items-center gap-1">
                                    <Gauge className="w-3 h-3" /> Engine Load
                                  </span>
                                  <div className="h-2 bg-[#21293a] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${Math.min((eq.engine_hours_per_day / 12) * 100, 100)}%`, background: barColor }} />
                                  </div>
                                  <span className="text-xs font-mono font-bold text-white">{eq.engine_hours_per_day.toFixed(1)}h / 12h target</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-[#5a6a7e] uppercase tracking-wider flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Idle Ratio
                                  </span>
                                  <div className="h-2 bg-[#21293a] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${Math.min(idleRatio, 100)}%`, background: idleRatio > 50 ? "#ef4444" : "#f59e0b" }} />
                                  </div>
                                  <span className={`text-xs font-mono font-bold ${idleRatio > 50 ? "text-red-400" : "text-amber-400"}`}>{idleRatio.toFixed(0)}%</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-[#5a6a7e] uppercase tracking-wider flex items-center gap-1">
                                    <User className="w-3 h-3" /> Operator
                                  </span>
                                  <p className="text-sm font-mono font-bold text-white">{eq.last_operator_id || "Unassigned"}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-[#5a6a7e] uppercase tracking-wider flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Location
                                  </span>
                                  <p className="text-sm font-mono font-bold text-white">{eq.site_id || "No site assigned"}</p>
                                  {eq.site_id && (
                                    <Link href="/map" className="text-[10px] text-[#ffcd11] hover:underline">View on map →</Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
