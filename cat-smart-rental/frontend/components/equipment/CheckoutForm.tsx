"use client";

import { useState } from "react";
import { checkoutRental } from "@/lib/api";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  equipmentId: string;
}

export function CheckoutForm({ equipmentId }: CheckoutFormProps) {
  const router = useRouter();
  const [operatorId, setOperatorId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [engineHours, setEngineHours] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorId || !siteId || engineHours === "") {
      setError("Please fill in all fields.");
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
        engine_hours_start: Number(engineHours)
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
      <div className="bg-graphite-800 border border-green-500/30 rounded p-4 text-center h-full flex flex-col justify-center">
        <h3 className="text-green-400 font-bold mb-2">ASSET ACTIVATED</h3>
        <p className="text-slate-300 text-sm">{equipmentId}</p>
        <p className="text-slate-300 text-sm">Assigned to {siteId}</p>
        <p className="text-slate-300 text-sm">Operator {operatorId}</p>
      </div>
    );
  }

  return (
    <div className="bg-graphite-800 border border-graphite-700 p-5 rounded-md h-full flex flex-col">
      <h3 className="text-white font-semibold mb-4 border-b border-graphite-700 pb-2">CHECK OUT ASSET</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-2 text-sm rounded">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Operator ID</label>
          <input
            type="text"
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
            className="w-full bg-graphite-900 border border-graphite-700 text-white rounded p-2 text-sm focus:outline-none focus:border-industrial-yellow"
            placeholder="e.g. OP105"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Site ID</label>
          <input
            type="text"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="w-full bg-graphite-900 border border-graphite-700 text-white rounded p-2 text-sm focus:outline-none focus:border-industrial-yellow"
            placeholder="e.g. S001"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Starting Engine Hours</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={engineHours}
            onChange={(e) => setEngineHours(e.target.value ? Number(e.target.value) : "")}
            className="w-full bg-graphite-900 border border-graphite-700 text-white rounded p-2 text-sm focus:outline-none focus:border-industrial-yellow"
            placeholder="0.0"
            required
          />
        </div>
        
        <div className="mt-auto pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-industrial-yellow hover:bg-industrial-yellow-hover text-graphite-900 font-bold py-2 px-4 rounded text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : "CONFIRM CHECK-OUT"}
          </button>
        </div>
      </form>
    </div>
  );
}
