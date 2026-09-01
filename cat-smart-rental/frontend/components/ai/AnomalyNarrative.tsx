"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { explainAnomaly } from "@/lib/api";
import { Anomaly } from "@/lib/types";

interface Props {
  anomaly: Anomaly;
}

export function AnomalyNarrative({ anomaly }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExpand() {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    if (narrative !== null) return;

    setLoading(true);
    setError(null);
    try {
      const text = await explainAnomaly(anomaly as unknown as Record<string, unknown>);
      setNarrative(text);
    } catch {
      setError("Could not generate Cat Fleet advisory. Ensure GEMINI_API_KEY is configured in backend/.env.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-1">
      <button
        onClick={handleExpand}
        id={`explain-${anomaly.equipment_id}-${anomaly.anomaly_type}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffcd11] hover:text-[#e5b700] transition-colors uppercase tracking-wider group"
      >
        <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform text-[#ffcd11]" />
        {open ? (
          <>
            Hide Advisory <ChevronUp className="w-3 h-3" />
          </>
        ) : (
          <>
            Cat AI Advisory <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {open && (
        <div className="mt-2 rounded bg-[#12161c] border border-[#ffcd11]/30 p-3.5 shadow-md">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#ffcd11] font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating Cat Telemetry Advisory…
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {narrative && !loading && (
            <p className="text-xs text-[#f1f5f9] leading-relaxed whitespace-pre-wrap font-sans">
              {narrative}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
