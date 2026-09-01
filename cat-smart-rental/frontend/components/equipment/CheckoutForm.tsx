"use client";

import { useState } from "react";
import { checkoutRental } from "@/lib/api";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Truck } from "lucide-react";

interface CheckoutFormProps {
  equipmentId: string;
}

export function CheckoutForm({ equipmentId }: CheckoutFormProps) {
  const router = useRouter();
  const [operatorId, setOperatorId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [engineHours, setEngineHours] = useState<number | "">("");
  const [durationDays, setDurationDays] = useState<number | "">(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorId || !siteId || engineHours === "") {
      setError("Please fill in all required fields.");
      return;
    }
    
    if (Number(engineHours) < 0) {
      setError("Engine hours must be >= 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await checkoutRental({
        equipment_id: equipmentId,
        operator_id: operatorId,
        site_id: siteId,
        engine_hours_start: Number(engineHours),
        rental_duration_days: durationDays === "" ? undefined : Number(durationDays)
      });
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to checkout equipment");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-lg p-6 text-center h-full flex flex-col justify-center items-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
        <h3 className="text-emerald-400 font-black text-sm uppercase tracking-wider mb-1">Asset Deployed</h3>
        <p className="text-white text-xs font-mono font-bold">{equipmentId}</p>
        <p className="text-[#94a3b8] text-xs mt-1 font-mono">Assigned to <span className="text-white font-bold">{siteId}</span> · Operator <span className="text-white font-bold">{operatorId}</span></p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#262d38]">
        <Truck className="w-4 h-4 text-[#ffcd11]" />
        <h3 className="text-white font-black text-xs uppercase tracking-wider">Deploy Asset to Site</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
        {error && (
          <div className="bg-red-950/30 border border-red-500/50 text-red-300 p-2.5 text-xs font-mono rounded">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] uppercase mb-1">Operator ID</label>
          <input
            type="text"
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
            className="cat-input font-mono"
            placeholder="e.g. OP105"
            required
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] uppercase mb-1">Job Site Location ID</label>
          <input
            type="text"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="cat-input font-mono"
            placeholder="e.g. S001"
            required
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] uppercase mb-1">Initial Engine Hours</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={engineHours}
            onChange={(e) => setEngineHours(e.target.value ? Number(e.target.value) : "")}
            className="cat-input font-mono"
            placeholder="0.0"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#64748b] uppercase mb-1">Rental Period (days)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value ? Number(e.target.value) : "")}
            className="cat-input font-mono"
            placeholder="14"
          />
        </div>

        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={loading}
            className="cat-btn-primary w-full justify-center py-2.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Deployment"}
          </button>
        </div>
      </form>
    </div>
  );
}
