"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutRental, checkinRental } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { Eye, QrCode, LogIn, LogOut, X } from "lucide-react";

interface EquipmentRowActionsProps {
  equipmentId: string;
  status: string;
}

export function EquipmentRowActions({ equipmentId, status }: EquipmentRowActionsProps) {
  const router = useRouter();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [opId, setOpId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [startHours, setStartHours] = useState("");
  const [endHours, setEndHours] = useState("");
  const [idleHours, setIdleHours] = useState("");
  const [notes, setNotes] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await checkoutRental({ equipment_id: equipmentId, operator_id: opId, site_id: siteId, engine_hours_start: parseFloat(startHours) });
      setIsCheckoutOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await checkinRental({ equipment_id: equipmentId, engine_hours_end: parseFloat(endHours), idle_hours: parseFloat(idleHours), notes: notes || undefined });
      setIsCheckinOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Link href={`/equipment/${equipmentId}`} className="p-1.5 text-slate-400 hover:text-industrial-yellow hover:bg-industrial-yellow/10 rounded border border-transparent hover:border-industrial-yellow/30 transition-all" title="View Details">
          <Eye className="w-4 h-4" />
        </Link>
        <button onClick={() => setIsQROpen(true)} className="p-1.5 text-slate-400 hover:text-white hover:bg-graphite-700 rounded border border-transparent hover:border-graphite-600 transition-all" title="View QR">
          <QrCode className="w-4 h-4" />
        </button>
        {status === "AVAILABLE" && (
          <button onClick={() => setIsCheckoutOpen(true)} className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded border border-transparent hover:border-green-500/30 transition-all" title="Check Out">
            <LogOut className="w-4 h-4" />
          </button>
        )}
        {status === "ACTIVE" && (
          <button onClick={() => setIsCheckinOpen(true)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded border border-transparent hover:border-blue-500/30 transition-all" title="Check In">
            <LogIn className="w-4 h-4" />
          </button>
        )}
      </div>

      {isQROpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsQROpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-1 text-center text-white">Equipment QR</h3>
            <p className="text-center text-industrial-yellow mb-6 font-mono text-sm tracking-wider">{equipmentId}</p>
            <div className="flex justify-center mb-6 bg-white p-4 rounded-md mx-auto w-max">
              <QRCodeSVG 
                value={`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/equipment/${equipmentId}`} 
                size={200} 
              />
            </div>
            <div className="mb-2 text-center">
              <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">Scan Target</p>
              <div className="flex items-center justify-between bg-graphite-950 border border-graphite-800 rounded p-2 overflow-hidden">
                <span className="text-xs text-slate-300 font-mono truncate mr-2">
                  {`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/equipment/${equipmentId}`}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/equipment/${equipmentId}`)}
                  className="text-xs bg-industrial-yellow text-black px-2 py-1.5 rounded-sm font-bold hover:bg-yellow-400 whitespace-nowrap transition-colors uppercase tracking-tight"
                >
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight flex items-center gap-2">
              <LogOut className="text-industrial-yellow w-5 h-5" /> CHECK OUT ASSET
            </h3>
            {error && <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-sm text-sm">{error}</div>}
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Operator ID</label>
                <input required type="text" value={opId} onChange={e => setOpId(e.target.value)} className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 text-white rounded-sm focus:outline-none focus:border-industrial-yellow font-mono text-sm" placeholder="e.g. OP-842" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Site ID</label>
                <input required type="text" value={siteId} onChange={e => setSiteId(e.target.value)} className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 text-white rounded-sm focus:outline-none focus:border-industrial-yellow font-mono text-sm" placeholder="e.g. SITE-A" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Starting Engine Hours</label>
                <input required type="number" step="0.1" min="0" value={startHours} onChange={e => setStartHours(e.target.value)} className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 text-white rounded-sm focus:outline-none focus:border-industrial-yellow font-mono text-sm" placeholder="0.0" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsCheckoutOpen(false)} disabled={loading} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white uppercase tracking-wider">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-industrial-yellow text-black rounded-sm text-sm font-bold hover:bg-yellow-400 disabled:opacity-50 uppercase tracking-wider transition-colors">{loading ? "Processing..." : "Deploy Asset"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCheckinOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-graphite-900 border border-graphite-700 rounded-md p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsCheckinOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight flex items-center gap-2">
              <LogIn className="text-industrial-yellow w-5 h-5" /> CHECK IN ASSET
            </h3>
            {error && <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-sm text-sm">{error}</div>}
            <form onSubmit={handleCheckin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Final Engine Hours</label>
                <input required type="number" step="0.1" min="0" value={endHours} onChange={e => setEndHours(e.target.value)} className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 text-white rounded-sm focus:outline-none focus:border-industrial-yellow font-mono text-sm" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Idle Hours</label>
                <input required type="number" step="0.1" min="0" value={idleHours} onChange={e => setIdleHours(e.target.value)} className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 text-white rounded-sm focus:outline-none focus:border-industrial-yellow font-mono text-sm" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Notes (Optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 text-white rounded-sm focus:outline-none focus:border-industrial-yellow text-sm" rows={3} placeholder="Any maintenance issues or observations..."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsCheckinOpen(false)} disabled={loading} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white uppercase tracking-wider">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-industrial-yellow text-black rounded-sm text-sm font-bold hover:bg-yellow-400 disabled:opacity-50 uppercase tracking-wider transition-colors">{loading ? "Processing..." : "Return Asset"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
