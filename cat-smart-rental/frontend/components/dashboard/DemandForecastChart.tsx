"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DemandForecastEntry } from "@/lib/types";

const TREND_COLOR: Record<string, string> = {
  increasing: "#fcc200", // industrial-yellow - action: pre-position equipment
  decreasing: "#64748b", // slate - informational, low priority
  stable: "#22c55e",     // green - healthy, no action needed
};

const TREND_LABEL: Record<string, string> = {
  increasing: "Rising demand",
  decreasing: "Falling demand",
  stable: "Stable",
};

interface TooltipPayloadItem {
  payload: DemandForecastEntry & { label: string };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="bg-graphite-950 border border-graphite-700 rounded-md px-3 py-2 text-xs shadow-lg">
      <p className="text-white font-semibold mb-1">{entry.site_id} &middot; {entry.equipment_type}</p>
      <p className="text-slate-400">{entry.avg_daily_engine_hours.toFixed(1)} avg engine h/day</p>
      <p style={{ color: TREND_COLOR[entry.trend] }}>{TREND_LABEL[entry.trend]}</p>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#2c2e33" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#2c2e33" }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#2c2e33" }}
              tickLine={false}
              label={{ value: "Avg engine h/day", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#25262b" }} />
            <Bar dataKey="avg_daily_engine_hours" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry) => (
                <Cell key={`${entry.site_id}-${entry.equipment_type}`} fill={TREND_COLOR[entry.trend]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-6 justify-center pt-2 border-t border-graphite-700 mt-2">
        {Object.entries(TREND_LABEL).map(([trend, label]) => (
          <div key={trend} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: TREND_COLOR[trend] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
