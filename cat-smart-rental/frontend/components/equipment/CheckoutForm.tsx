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
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center h-full flex flex-col justify-center items-center">
        <CheckCircle2 className="w-10 h-10 text-rm-green mb-2" />
        <h3 className="text-rm-green font-bold text-base mb-1">Asset Checked Out</h3>
        <p className="text-rm-text-primary text-sm font-semibold">{equipmentId}</p>
        <p className="text-rm-text-secondary text-xs mt-1">Assigned to <span className="font-bold text-rm-text-primary">{siteId}</span> · Operator <span className="font-bold text-rm-text-primary">{operatorId}</span></p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-rm-border">
        <Truck className="w-4 h-4 text-rm-red" />
        <h3 className="text-rm-text-primary font-bold text-sm uppercase tracking-wider">Check Out Machine</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3.5 flex-1 flex flex-col">
        {error && (
          <div className="bg-red-50 border border-red-200 text-rm-red p-2.5 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-[11px] font-bold text-rm-text-muted uppercase mb-1">Operator ID</label>
          <input
            type="text"
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
            className="rm-input"
            placeholder="e.g. OP105"
            required
          />
        </div>
        
        <div>
          <label className="block text-[11px] font-bold text-rm-text-muted uppercase mb-1">Site Location ID</label>
          <input
            type="text"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="rm-input"
            placeholder="e.g. S001"
            required
          />
        </div>
        
        <div>
          <label className="block text-[11px] font-bold text-rm-text-muted uppercase mb-1">Starting Engine Hours</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={engineHours}
            onChange={(e) => setEngineHours(e.target.value ? Number(e.target.value) : "")}
            className="rm-input font-mono"
            placeholder="0.0"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-rm-text-muted uppercase mb-1">Rental Duration (days)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value ? Number(e.target.value) : "")}
            className="rm-input font-mono"
            placeholder="14"
          />
        </div>

        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={loading}
            className="rm-btn-primary w-full justify-center py-2.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Check Out"}
          </button>
        </div>
      </form>
    </div>
  );
}
