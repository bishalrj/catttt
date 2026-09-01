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
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-700",
    icon: CheckCircle2,
  },
  Monitor: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: AlertCircle,
  },
  Refurbish: {
    border: "border-orange-200",
    bg: "bg-orange-50",
    text: "text-orange-700",
    icon: Wrench,
  },
  Retire: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: XCircle,
  },
};

const ROI_GRADE_STYLE: Record<string, string> = {
  A: "text-green-700 bg-green-50 border-green-200",
  B: "text-blue-700 bg-blue-50 border-blue-200",
  C: "text-amber-700 bg-amber-50 border-amber-200",
  D: "text-red-700 bg-red-50 border-red-200",
};

const ANOMALY_SEVERITY_STYLE: Record<string, string> = {
  high: "rm-badge rm-badge-high",
  medium: "rm-badge rm-badge-medium",
  low: "rm-badge rm-badge-low",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function ScoreMeter({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const color =
    pct >= 80
      ? "#1a9e5f"
      : pct >= 50
      ? "#d97706"
      : pct >= 25
      ? "#ea580c"
      : "#e63329";

  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke="#f0f0f0"
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
        <span className="text-2xl font-black text-rm-text-primary leading-none">{pct.toFixed(0)}</span>
        <span className="text-[11px] font-semibold text-rm-text-muted">/100</span>
      </div>
    </div>
  );
}

function RefurbCard({ refurb }: { refurb: RefurbishmentScore }) {
  const style = BAND_STYLE[refurb.band] ?? BAND_STYLE.Monitor;
  const BandIcon = style.icon;

  return (
    <div className={`rm-card p-6 border ${style.border}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xs font-bold text-rm-text-muted uppercase tracking-wider mb-1.5">
            Refurbishment Assessment &amp; Health Index
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${style.bg}`}>
              <BandIcon className={`w-5 h-5 ${style.text}`} />
            </div>
            <span className={`text-xl font-extrabold ${style.text}`}>{refurb.band}</span>
          </div>
          <p className="text-sm text-rm-text-secondary leading-relaxed max-w-md">{refurb.recommendation}</p>
        </div>
        <ScoreMeter score={refurb.score} />
      </div>

      {/* Score breakdown */}
      <div className="mt-5 pt-4 border-t border-rm-border-light grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Wear Penalty", value: `-${refurb.breakdown.wear_penalty}`, bad: true },
          { label: "Downtime Penalty", value: `-${refurb.breakdown.downtime_penalty}`, bad: true },
          { label: "Anomaly Penalty", value: `-${refurb.breakdown.anomaly_penalty}`, bad: true },
          { label: "Utilisation Bonus", value: `+${refurb.breakdown.utilisation_bonus}`, bad: false },
        ].map(({ label, value, bad }) => (
          <div key={label} className="bg-slate-50 border border-rm-border-light rounded-xl p-3">
            <p className="text-[11px] font-semibold text-rm-text-muted mb-0.5">{label}</p>
            <p className={`text-base font-bold ${bad ? "text-rm-red" : "text-rm-green"}`}>{value}</p>
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
          className={`w-3.5 h-3.5 rounded-full border-2 mt-1 shrink-0 ${
            isActive
              ? "bg-rm-green border-green-200 shadow-sm"
              : "bg-white border-rm-border"
          }`}
        />
        {index >= 0 && (
          <div className="w-0.5 flex-1 bg-rm-border mt-1" />
        )}
      </div>

      {/* Content */}
      <div className="rm-card p-5 mb-4 flex-1">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-rm-text-primary">{event.site_id}</span>
              {isActive && (
                <span className="rm-badge rm-badge-active">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-rm-text-secondary mt-0.5">Operator: <span className="font-medium text-rm-text-primary">{event.operator_id}</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-rm-text-secondary">
              {event.checkout_time ? format(new Date(event.checkout_time), "MMM dd, yyyy") : "—"}
              {" → "}
              {event.checkin_time ? format(new Date(event.checkin_time), "MMM dd, yyyy") : "Present"}
            </p>
            {event.duration_days != null && (
              <p className="text-xs text-rm-text-muted font-medium">{event.duration_days} days</p>
            )}
          </div>
        </div>

        {/* Telemetry row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-rm-border-light">
          <div>
            <p className="text-rm-text-muted mb-0.5">Engine Run</p>
            <p className="font-mono font-bold text-rm-text-primary">{event.engine_hours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-rm-text-muted mb-0.5">Idle Time</p>
            <p className="font-mono font-medium text-rm-text-secondary">{event.idle_hours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-rm-text-muted mb-0.5">Utilisation</p>
            <p className="font-mono font-bold text-rm-text-primary">{event.utilisation_pct.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-rm-text-muted mb-0.5">Fuel</p>
            <p className="font-mono font-medium text-rm-text-secondary">{event.fuel_used_liters.toFixed(0)}L</p>
          </div>
          <div>
            <p className="text-rm-text-muted mb-0.5">Downtime</p>
            <p className={`font-mono font-bold ${event.downtime_hours > 0 ? "text-amber-600" : "text-rm-text-primary"}`}>
              {event.downtime_hours.toFixed(1)}h
            </p>
          </div>
        </div>

        {/* Cumulative + ROI */}
        <div className="mt-3 pt-3 border-t border-rm-border-light flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-rm-text-secondary">
            <Gauge className="w-3.5 h-3.5 text-rm-text-muted" />
            <span>Cumulative Engine: <span className="font-bold text-rm-text-primary font-mono">{event.cumulative_engine_hours.toFixed(0)}h</span></span>
          </div>

          {event.roi.grade ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rm-text-muted">Rental ROI:</span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${ROI_GRADE_STYLE[event.roi.grade]}`}
              >
                Grade {event.roi.grade} — {event.roi.label}
              </span>
            </div>
          ) : (
            <span className="text-xs text-rm-text-muted">ROI: {event.roi.label}</span>
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
      <div className="max-w-5xl mx-auto space-y-6 rm-page-enter">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-rm-text-muted">
          <Link href="/equipment" className="hover:text-rm-red transition-colors">
            Equipment
          </Link>
          <span>/</span>
          <Link
            href={`/equipment/${equipmentId}`}
            className="hover:text-rm-red transition-colors font-mono font-medium"
          >
            {equipmentId}
          </Link>
          <span>/</span>
          <span className="text-rm-text-primary font-semibold">Lifecycle &amp; Refurbishment</span>
        </div>

        {/* Header */}
        <div className="rm-page-header flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="rm-section-heading text-2xl">
              Asset Lifecycle — <span className="accent font-mono">{lifecycle.equipment_id}</span>
            </h1>
            <p className="text-rm-text-secondary mt-1 text-sm">
              {lifecycle.equipment_type} · {lifecycle.total_rentals} recorded rentals ·{" "}
              <span className="font-semibold text-rm-text-primary">{lifecycle.cumulative_engine_hours.toFixed(0)}h</span> cumulative engine hours
            </p>
          </div>
          <Link
            href={`/equipment/${equipmentId}`}
            className="rm-btn-ghost text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Asset Details
          </Link>
        </div>

        {/* Refurbishment Score */}
        <RefurbCard refurb={lifecycle.refurbishment} />

        {/* Active anomalies */}
        {lifecycle.active_anomalies.length > 0 && (
          <div className="rm-card overflow-hidden border-red-200">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50/60 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rm-red" />
              <h3 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                Active Anomalies ({lifecycle.active_anomalies.length})
              </h3>
            </div>
            <div className="divide-y divide-red-100">
              {lifecycle.active_anomalies.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-6 py-3.5">
                  <span className={ANOMALY_SEVERITY_STYLE[a.severity]}>
                    {a.severity.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm text-rm-text-primary font-bold">{a.anomaly_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-rm-text-secondary mt-0.5">{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="rm-card overflow-hidden">
          <div className="px-6 py-4 border-b border-rm-border bg-slate-50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rm-red" />
            <h3 className="text-xs font-bold text-rm-text-secondary uppercase tracking-wider">
              Rental History Timeline ({lifecycle.total_rentals} assignments)
            </h3>
          </div>
          <div className="p-6">
            {lifecycle.timeline.length === 0 ? (
              <div className="py-12 text-center text-rm-text-muted">
                <Box className="w-8 h-8 mx-auto mb-2 text-slate-300" />
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
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-red-200">
        <h2 className="text-xl font-bold text-rm-red mb-2">Error Loading Lifecycle Data</h2>
        <p className="text-rm-text-secondary text-sm">Could not compute lifecycle for this asset.</p>
        <Link
          href="/equipment"
          className="text-rm-red hover:underline mt-4 inline-block font-semibold text-sm"
        >
          &larr; Return to equipment list
        </Link>
      </div>
    );
  }
}
