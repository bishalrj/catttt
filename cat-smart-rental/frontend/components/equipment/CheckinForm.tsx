"use client";

import { useState } from "react";
import { checkinRental } from "@/lib/api";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Wrench } from "lucide-react";

interface CheckinFormProps {
  equipmentId: string;
  checkoutDate: string;
}

export function CheckinForm({ equipmentId, checkoutDate }: CheckinFormProps) {
  const router = useRouter();
  const [engineHoursEnd, setEngineHoursEnd] = useState<number | "">("");
  const [idleHours, setIdleHours] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (engineHoursEnd === "" || idleHours === "") {
      setError("Please fill in engine and idle hours.");
      return;
    }
    
    if (Number(idleHours) < 0) {
      setError("Idle hours must be >= 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await checkinRental({
        equipment_id: equipmentId,
        engine_hours_end: Number(engineHoursEnd),
        idle_hours: Number(idleHours),
        notes: notes || undefined
      });
      setSuccessData(res);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to checkin equipment");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    const runtime = (successData.engine_hours_end || 0) - (successData.engine_hours_start || 0);
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center h-full flex flex-col justify-center items-center">
        <CheckCircle2 className="w-10 h-10 text-rm-green mb-2" />
        <h3 className="text-rm-green font-bold text-base mb-1">Asset Returned</h3>
        <p className="text-rm-text-primary text-sm font-semibold">Duration: {successData.rental_duration_days} days</p>
        <p className="text-rm-text-secondary text-xs mt-1">Total runtime: <span className="font-bold text-rm-text-primary">{runtime.toFixed(1)} hrs</span> · Idle: <span className="font-bold text-rm-text-primary">{successData.idle_hours} hrs</span></p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-rm-border">
        <Wrench className="w-4 h-4 text-rm-red" />
        <h3 className="text-rm-text-primary font-bold text-sm uppercase tracking-wider">Check In Machine</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3.5 flex-1 flex flex-col">
        {error && (
          <div className="bg-red-50 border border-red-200 text-rm-red p-2.5 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-[11px] font-bold text-rm-text-muted uppercase mb-1">Final Engine Hours</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={engineHoursEnd}
            onChange={(e) => setEngineHoursEnd(e.target.value ? Number(e.target.value) : "")}
            className="rm-input font-mono"
            placeholder="0.0"
            required
          />
        </div>
        
        <div>
          <label className="block text-[11px] font-bold text-rm-text-muted uppercase mb-1">Idle Hours Logged</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={idleHours}
            onChange={(e) => setIdleHours(e.target.value ? Number(e.target.value) : "")}
            className="rm-input font-mono"
            placeholder="0.0"
            required
          />
        </div>
        
        <div>
          <label className="block text-[11px] font-bold text-rm-text-muted uppercase mb-1">Return Condition / Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rm-input resize-none h-20 text-xs"
            placeholder="Optional return telemetry notes..."
          />
        </div>
        
        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={loading}
            className="rm-btn-secondary w-full justify-center py-2.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Check In"}
          </button>
        </div>
      </form>
    </div>
  );
}
