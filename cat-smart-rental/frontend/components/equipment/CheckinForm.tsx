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
      setError("Please log final engine and idle hours.");
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
      <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-lg p-6 text-center h-full flex flex-col justify-center items-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
        <h3 className="text-emerald-400 font-black text-sm uppercase tracking-wider mb-1">Asset Returned &amp; Logged</h3>
        <p className="text-white text-xs font-mono font-bold">Duration: {successData.rental_duration_days} days</p>
        <p className="text-[#94a3b8] text-xs mt-1 font-mono">Runtime: <span className="text-[#ffcd11] font-bold">{runtime.toFixed(1)} hrs</span> · Idle: <span className="text-white font-bold">{successData.idle_hours} hrs</span></p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#262d38]">
        <Wrench className="w-4 h-4 text-[#ffcd11]" />
        <h3 className="text-white font-black text-xs uppercase tracking-wider">Check In &amp; Telemetry Log</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
        {error && (
          <div className="bg-red-950/30 border border-red-500/50 text-red-300 p-2.5 text-xs font-mono rounded">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] uppercase mb-1">Final Engine Hours Readout</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={engineHoursEnd}
            onChange={(e) => setEngineHoursEnd(e.target.value ? Number(e.target.value) : "")}
            className="cat-input font-mono"
            placeholder="0.0"
            required
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] uppercase mb-1">Total Idle Hours Logged</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={idleHours}
            onChange={(e) => setIdleHours(e.target.value ? Number(e.target.value) : "")}
            className="cat-input font-mono"
            placeholder="0.0"
            required
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] uppercase mb-1">Return Notes / Inspection</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="cat-input resize-none h-20 text-xs font-mono"
            placeholder="Log machine wear, fault codes, or inspection notes..."
          />
        </div>
        
        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={loading}
            className="cat-btn-secondary w-full justify-center py-2.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Check-In"}
          </button>
        </div>
      </form>
    </div>
  );
}
