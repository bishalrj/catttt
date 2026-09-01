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
    if (narrative !== null) return; // Already fetched

    setLoading(true);
    setError(null);
    try {
      const text = await explainAnomaly(anomaly as unknown as Record<string, unknown>);
      setNarrative(text);
    } catch {
      setError("Could not generate explanation. Ensure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-0">
      <button
        onClick={handleExpand}
        id={`explain-${anomaly.equipment_id}-${anomaly.anomaly_type}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors group"
      >
        <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
        {open ? (
          <>
            Hide <ChevronUp className="w-3 h-3" />
          </>
        ) : (
          <>
            Explain <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {open && (
        <div className="mt-2 rounded-md border border-violet-500/20 bg-violet-500/5 p-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-violet-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating advisory…
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {narrative && !loading && (
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {narrative}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
