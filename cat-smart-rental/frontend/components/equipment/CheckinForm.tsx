"use client";

import { useState } from "react";
import { checkinRental } from "@/lib/api";
import { useRouter } from "next/navigation";

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
      <div className="bg-graphite-800 border border-green-500/30 rounded p-4 text-center h-full flex flex-col justify-center">
        <h3 className="text-green-400 font-bold mb-2">ASSET RETURNED</h3>
        <p className="text-slate-300 text-sm">Duration: {successData.rental_duration_days} days</p>
        <p className="text-slate-300 text-sm">Total runtime: {runtime.toFixed(1)} hrs</p>
        <p className="text-slate-300 text-sm">Idle hours: {successData.idle_hours} hrs</p>
      </div>
    );
  }

  return (
    <div className="bg-graphite-800 border border-graphite-700 p-5 rounded-md h-full flex flex-col">
      <h3 className="text-white font-semibold mb-4 border-b border-graphite-700 pb-2">CHECK IN ASSET</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-2 text-sm rounded">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Final Engine Hours</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={engineHoursEnd}
            onChange={(e) => setEngineHoursEnd(e.target.value ? Number(e.target.value) : "")}
            className="w-full bg-graphite-900 border border-graphite-700 text-white rounded p-2 text-sm focus:outline-none focus:border-industrial-yellow"
            placeholder="0.0"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Idle Hours</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={idleHours}
            onChange={(e) => setIdleHours(e.target.value ? Number(e.target.value) : "")}
            className="w-full bg-graphite-900 border border-graphite-700 text-white rounded p-2 text-sm focus:outline-none focus:border-industrial-yellow"
            placeholder="0.0"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-graphite-900 border border-graphite-700 text-white rounded p-2 text-sm focus:outline-none focus:border-industrial-yellow resize-none h-20"
            placeholder="Optional return notes..."
          />
        </div>
        
        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-graphite-700 hover:bg-graphite-600 text-white font-bold py-2 px-4 rounded text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : "CONFIRM CHECK-IN"}
          </button>
        </div>
      </form>
    </div>
  );
}
