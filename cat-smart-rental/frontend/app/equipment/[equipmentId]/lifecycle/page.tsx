import { getEquipmentLifecycle } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Box,
  Gauge,
  Cpu,
} from "lucide-react";
import { LifecycleEvent, RefurbishmentScore } from "@/lib/types";
import { format } from "date-fns";

// ── Score styling ──────────────────────────────────────────────────────────

const BAND_STYLE: Record<string, { border: string; bg: string; text: string; icon: React.ElementType }> = {
  Healthy: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  Monitor: {
    border: "border-[#ffcd11]/40",
    bg: "bg-[#ffcd11]/10",
    text: "text-[#ffcd11]",
    icon: AlertCircle,
  },
  Refurbish: {
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    icon: Wrench,
  },
  Retire: {
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    text: "text-red-400",
    icon: XCircle,
  },
};

const ROI_GRADE_STYLE: Record<string, string> = {
  A: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  B: "text-[#38bdf8] bg-sky-500/15 border-sky-500/30",
  C: "text-[#ffcd11] bg-[#ffcd11]/15 border-[#ffcd11]/30",
  D: "text-red-400 bg-red-500/15 border-red-500/30",
};

const ANOMALY_SEVERITY_STYLE: Record<string, string> = {
  high: "cat-badge cat-badge-high",
  medium: "cat-badge cat-badge-medium",
  low: "cat-badge cat-badge-low",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function ScoreMeter({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const color =
    pct >= 80
      ? "#10b981"
      : pct >= 50
      ? "#ffcd11"
      : pct >= 25
      ? "#f97316"
      : "#ef4444";

  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke="#1e242d"
          strokeWidth="10"
        />
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white font-mono leading-none">{pct.toFixed(0)}</span>
        <span className="text-[10px] font-bold text-[#64748b]">/100</span>
      </div>
    </div>
  );
}

function RefurbCard({ refurb }: { refurb: RefurbishmentScore }) {
  const style = BAND_STYLE[refurb.band] ?? BAND_STYLE.Monitor;
  const BandIcon = style.icon;

  return (
    <div className={`cat-card p-6 border ${style.border}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
            Machine Health Index &amp; Refurbishment Assessment
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded ${style.bg}`}>
              <BandIcon className={`w-5 h-5 ${style.text}`} />
            </div>
            <span className={`text-xl font-black uppercase tracking-wide ${style.text}`}>{refurb.band}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed max-w-md">{refurb.recommendation}</p>
        </div>
        <ScoreMeter score={refurb.score} />
      </div>

      {/* Score Breakdown */}
      <div className="mt-5 pt-4 border-t border-[#262d38] grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Wear Penalty", value: `-${refurb.breakdown.wear_penalty}`, bad: true },
          { label: "Downtime Penalty", value: `-${refurb.breakdown.downtime_penalty}`, bad: true },
          { label: "Anomaly Penalty", value: `-${refurb.breakdown.anomaly_penalty}`, bad: true },
          { label: "Utilisation Bonus", value: `+${refurb.breakdown.utilisation_bonus}`, bad: false },
        ].map(({ label, value, bad }) => (
          <div key={label} className="bg-[#12161c] border border-[#262d38] rounded p-3">
            <p className="text-[10px] font-bold text-[#64748b] uppercase mb-0.5">{label}</p>
            <p className={`text-sm font-black font-mono ${bad ? "text-red-400" : "text-[#10b981]"}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ event, index }: { event: LifecycleEvent; index: number }) {
  const isActive = event.status === "active";
  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3.5 h-3.5 rounded-xs border-2 mt-1 shrink-0 ${
            isActive
              ? "bg-[#ffcd11] border-[#ffcd11] shadow-[0_0_8px_rgba(255,205,17,0.5)]"
              : "bg-[#181d24] border-[#262d38]"
          }`}
        />
        {index >= 0 && (
          <div className="w-0.5 flex-1 bg-[#262d38] mt-1" />
        )}
      </div>

      {/* Content */}
      <div className="cat-card p-5 mb-4 flex-1">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white font-mono">{event.site_id}</span>
              {isActive && (
                <span className="cat-badge cat-badge-active">
                  ACTIVE DEPLOYMENT
                </span>
              )}
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5 font-mono">Operator: <span className="text-white font-bold">{event.operator_id}</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#94a3b8] font-mono">
              {event.checkout_time ? format(new Date(event.checkout_time), "MMM dd, yyyy") : "—"}
              {" → "}
              {event.checkin_time ? format(new Date(event.checkin_time), "MMM dd, yyyy") : "Present"}
            </p>
            {event.duration_days != null && (
              <p className="text-xs text-[#64748b] font-mono font-bold">{event.duration_days} days logged</p>
            )}
          </div>
        </div>

        {/* Telemetry row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-[#12161c] p-3 rounded border border-[#262d38]">
          <div>
            <p className="text-[#64748b] text-[10px] uppercase font-bold mb-0.5">Engine Run</p>
            <p className="font-mono font-bold text-white">{event.engine_hours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-[#64748b] text-[10px] uppercase font-bold mb-0.5">Idle Time</p>
            <p className="font-mono text-[#94a3b8]">{event.idle_hours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-[#64748b] text-[10px] uppercase font-bold mb-0.5">Utilisation</p>
            <p className="font-mono font-bold text-[#ffcd11]">{event.utilisation_pct.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-[#64748b] text-[10px] uppercase font-bold mb-0.5">Fuel Burn</p>
            <p className="font-mono text-[#94a3b8]">{event.fuel_used_liters.toFixed(0)}L</p>
          </div>
          <div>
            <p className="text-[#64748b] text-[10px] uppercase font-bold mb-0.5">Downtime</p>
            <p className={`font-mono font-bold ${event.downtime_hours > 0 ? "text-amber-400" : "text-[#94a3b8]"}`}>
              {event.downtime_hours.toFixed(1)}h
            </p>
          </div>
        </div>

        {/* Cumulative + ROI */}
        <div className="mt-3 pt-3 border-t border-[#262d38] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <Gauge className="w-3.5 h-3.5 text-[#ffcd11]" />
            <span>Cumulative Engine Hours: <span className="font-bold text-white font-mono">{event.cumulative_engine_hours.toFixed(0)}h</span></span>
          </div>

          {event.roi.grade ? (
            <div className="flex items-center gap-2">
              <span className="text-[#64748b] text-[11px]">Rental Yield:</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${ROI_GRADE_STYLE[event.roi.grade]}`}
              >
                GRADE {event.roi.grade} — {event.roi.label}
              </span>
            </div>
          ) : (
            <span className="text-[#64748b] text-xs font-mono">ROI: {event.roi.label}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function LifecyclePage({
  params,
}: {
  params: Promise<{ equipmentId: string }>;
}) {
  try {
    const { equipmentId } = await params;
    const lifecycle = await getEquipmentLifecycle(equipmentId);

    return (
      <div className="max-w-5xl mx-auto space-y-6 cat-page-enter">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64748b] uppercase font-bold tracking-wider">
          <Link href="/equipment" className="hover:text-[#ffcd11] transition-colors">
            Fleet
          </Link>
          <span>/</span>
          <Link
            href={`/equipment/${equipmentId}`}
            className="hover:text-[#ffcd11] transition-colors font-mono"
          >
            {equipmentId}
          </Link>
          <span>/</span>
          <span className="text-white">Lifecycle Telematics &amp; ROI</span>
        </div>

        {/* Header */}
        <div className="cat-page-header flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="cat-section-heading text-xl">
              Asset Lifecycle — <span className="accent font-mono">{lifecycle.equipment_id}</span>
            </h1>
            <p className="text-[#94a3b8] mt-1 text-xs">
              {lifecycle.equipment_type} · {lifecycle.total_rentals} assignments ·{" "}
              <span className="font-mono font-bold text-white">{lifecycle.cumulative_engine_hours.toFixed(0)}h</span> cumulative engine hours logged
            </p>
          </div>
          <Link
            href={`/equipment/${equipmentId}`}
            className="cat-btn-ghost text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Asset Details
          </Link>
        </div>

        {/* Refurbishment Score */}
        <RefurbCard refurb={lifecycle.refurbishment} />

        {/* Active Anomalies */}
        {lifecycle.active_anomalies.length > 0 && (
          <div className="cat-card overflow-hidden border-red-500/40">
            <div className="px-5 py-3 border-b border-[#262d38] bg-red-950/20 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-black text-red-400 uppercase tracking-wider">
                Active Anomalies ({lifecycle.active_anomalies.length})
              </h3>
            </div>
            <div className="divide-y divide-[#262d38]">
              {lifecycle.active_anomalies.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3">
                  <span className={ANOMALY_SEVERITY_STYLE[a.severity]}>
                    {a.severity.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white uppercase">{a.anomaly_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="cat-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#262d38] bg-[#11151b] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ffcd11]" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Deployment Telematics Timeline ({lifecycle.total_rentals} assignments)
            </h3>
          </div>
          <div className="p-5">
            {lifecycle.timeline.length === 0 ? (
              <div className="py-12 text-center text-[#64748b]">
                <Box className="w-8 h-8 mx-auto mb-2 text-[#323b49]" />
                No rental history found for this equipment.
              </div>
            ) : (
              <div>
                {lifecycle.timeline.map((event, i) => (
                  <TimelineRow key={event.rental_id} event={event} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-[#151a21] rounded-lg border border-red-500/40">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Lifecycle Data</h2>
        <p className="text-[#94a3b8] text-xs">Could not compute lifecycle for this asset.</p>
        <Link
          href="/equipment"
          className="text-[#ffcd11] hover:underline mt-4 inline-block font-mono text-xs"
        >
          &larr; Return to equipment list
        </Link>
      </div>
    );
  }
}
