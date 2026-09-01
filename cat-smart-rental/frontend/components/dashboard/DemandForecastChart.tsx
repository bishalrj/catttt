"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DemandForecastEntry } from "@/lib/types";

const TREND_COLOR: Record<string, string> = {
  increasing: "#ffcd11", // Cat Yellow - action: pre-position equipment
  decreasing: "#64748b", // Slate - informational, low priority
  stable: "#10b981",     // Emerald - healthy, operational stability
};

const TREND_LABEL: Record<string, string> = {
  increasing: "Rising Demand (Pre-position)",
  decreasing: "Falling Demand",
  stable: "Stable Utilization",
};

interface TooltipPayloadItem {
  payload: DemandForecastEntry & { label: string };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="bg-[#0f1216] border border-[#ffcd11]/40 rounded p-3 text-xs shadow-xl font-mono">
      <p className="text-white font-bold mb-1 uppercase tracking-wide">{entry.site_id} &middot; {entry.equipment_type}</p>
      <p className="text-[#94a3b8]">{entry.avg_daily_engine_hours.toFixed(1)} avg engine hrs/day</p>
      <p className="font-bold mt-1" style={{ color: TREND_COLOR[entry.trend] }}>{TREND_LABEL[entry.trend]}</p>
    </div>
  );
}

export function DemandForecastChart({ forecast }: { forecast: DemandForecastEntry[] }) {
  const data = forecast.map((f) => ({ ...f, label: `${f.site_id} · ${f.equipment_type}` }));

  return (
    <div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262d38" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
              axisLine={{ stroke: "#262d38" }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
              axisLine={{ stroke: "#262d38" }}
              tickLine={false}
              label={{ value: "Avg Engine Hrs / Day", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 10 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#1a2029" }} />
            <Bar dataKey="avg_daily_engine_hours" radius={[3, 3, 0, 0]} maxBarSize={36}>
              {data.map((entry) => (
                <Cell key={`${entry.site_id}-${entry.equipment_type}`} fill={TREND_COLOR[entry.trend]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-6 justify-center pt-3 border-t border-[#262d38] mt-2">
        {Object.entries(TREND_LABEL).map(([trend, label]) => (
          <div key={trend} className="flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
            <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: TREND_COLOR[trend] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
