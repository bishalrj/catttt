"use client";

import { useEffect, useState } from "react";
import { Gauge, Flame, Zap, Droplet, Activity, Radio, AlertTriangle, ShieldCheck } from "lucide-react";

interface LiveGaugeClusterProps {
  equipmentId: string;
  equipmentType: string;
  status: string;
}

export function LiveGaugeCluster({ equipmentId, equipmentType, status }: LiveGaugeClusterProps) {
  const isOperating = status === "ACTIVE";

  const [rpm, setRpm] = useState(isOperating ? 1750 : 0);
  const [hydraulicPsi, setHydraulicPsi] = useState(isOperating ? 3200 : 450);
  const [coolantTemp, setCoolantTemp] = useState(isOperating ? 88 : 32);
  const [oilTemp, setOilTemp] = useState(isOperating ? 94 : 35);
  const [fuelPct, setFuelPct] = useState(78);
  const [defPct, setDefPct] = useState(85);
  const [vibrationG, setVibrationG] = useState(isOperating ? 1.4 : 0.05);

  useEffect(() => {
    if (!isOperating) return;

    // Real-time IoT telemetric sensor simulation ticks
    const interval = setInterval(() => {
      setRpm((prev) => Math.min(2200, Math.max(1400, Math.round(prev + (Math.random() * 80 - 40)))));
      setHydraulicPsi((prev) => Math.min(3600, Math.max(2800, Math.round(prev + (Math.random() * 60 - 30)))));
      setCoolantTemp((prev) => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setOilTemp((prev) => +(prev + (Math.random() * 0.3 - 0.15)).toFixed(1));
      setVibrationG((prev) => +(Math.min(2.8, Math.max(0.8, prev + (Math.random() * 0.2 - 0.1)))).toFixed(2));
      setFuelPct((prev) => Math.max(10, +(prev - 0.005).toFixed(2)));
    }, 2500);

    return () => clearInterval(interval);
  }, [isOperating]);

  // Gauge angle calculation (0 to 180 deg)
  const rpmPct = Math.min(100, Math.max(0, (rpm / 2500) * 100));
  const hydraulicPct = Math.min(100, Math.max(0, (hydraulicPsi / 4000) * 100));

  return (
    <div className="cat-card p-6 sm:p-8 space-y-6 shadow-xl border-[#ffcd11]/30">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#262d38]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-black border border-[#ffcd11] flex items-center justify-center font-mono font-bold text-xs text-[#ffcd11] shadow-md">
            IOT
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ffcd11]" />
              Cat&reg; Electronic Technician Live Digital Twin
            </h3>
            <p className="text-xs text-[#94a3b8] font-mono">
              J1939 CAN-bus telemetry broadcast &bull; Asset #{equipmentId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOperating ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY STREAMING (2.5s)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-xs font-bold">
              ENGINE OFF &bull; STANDBY MODE
            </span>
          )}
        </div>
      </div>

      {/* 4-Gauge Cluster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gauge 1: Engine RPM */}
        <div className="bg-[#12161c] p-5 rounded-lg border border-[#262d38] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
            <span>Engine RPM</span>
            <Gauge className="w-4 h-4 text-[#ffcd11]" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
            {rpm} <span className="text-xs text-[#64748b] font-normal">RPM</span>
          </div>
          {/* Progress Bar Gauge */}
          <div className="w-full bg-[#1e242d] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-[#ffcd11] to-red-500 h-full transition-all duration-700 ease-out"
              style={{ width: `${rpmPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#64748b]">
            <span>0</span>
            <span>1,250</span>
            <span>2,500</span>
          </div>
        </div>

        {/* Gauge 2: Hydraulic PSI */}
        <div className="bg-[#12161c] p-5 rounded-lg border border-[#262d38] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
            <span>Hydraulic Line</span>
            <Zap className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
            {hydraulicPsi} <span className="text-xs text-[#64748b] font-normal">PSI</span>
          </div>
          <div className="w-full bg-[#1e242d] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#38bdf8] h-full transition-all duration-700 ease-out"
              style={{ width: `${hydraulicPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#64748b]">
            <span>0 PSI</span>
            <span>NOMINAL 3.2K</span>
            <span>4,000</span>
          </div>
        </div>

        {/* Gauge 3: Coolant & Oil Temp */}
        <div className="bg-[#12161c] p-5 rounded-lg border border-[#262d38] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
            <span>Thermal Status</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Coolant</span>
              <span className="text-lg font-black font-mono text-white">{coolantTemp}&deg;C</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Engine Oil</span>
              <span className="text-lg font-black font-mono text-[#ffcd11]">{oilTemp}&deg;C</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> TEMPERATURE OPTIMAL
          </div>
        </div>

        {/* Gauge 4: Fuel & DEF Fluid */}
        <div className="bg-[#12161c] p-5 rounded-lg border border-[#262d38] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
            <span>Fluid Reservoirs</span>
            <Droplet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-[#94a3b8] mb-1">
                <span>Diesel Fuel</span>
                <span className="font-bold text-white">{fuelPct}%</span>
              </div>
              <div className="w-full bg-[#1e242d] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#ffcd11] h-full" style={{ width: `${fuelPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-[#94a3b8] mb-1">
                <span>DEF Level</span>
                <span className="font-bold text-[#38bdf8]">{defPct}%</span>
              </div>
              <div className="w-full bg-[#1e242d] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#38bdf8] h-full" style={{ width: `${defPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
