"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutRental, checkinRental } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import { LogIn, LogOut, QrCode, X } from "lucide-react";

interface EquipmentActionsProps {
  equipmentId: string;
  status: string;
}

export function EquipmentActions({ equipmentId, status }: EquipmentActionsProps) {
  const router = useRouter();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checkout Form State
  const [opId, setOpId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [startHours, setStartHours] = useState("");

  // Checkin Form State
  const [endHours, setEndHours] = useState("");
  const [idleHours, setIdleHours] = useState("");
  const [notes, setNotes] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await checkoutRental({
        equipment_id: equipmentId,
        operator_id: opId,
        site_id: siteId,
        engine_hours_start: parseFloat(startHours)
      });
      setIsCheckoutOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await checkinRental({
        equipment_id: equipmentId,
        engine_hours_end: parseFloat(endHours),
        idle_hours: parseFloat(idleHours),
        notes: notes || undefined
      });
      setIsCheckinOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button 
        onClick={() => setIsQROpen(true)}
        className="cat-btn-ghost text-xs"
      >
        <QrCode className="w-3.5 h-3.5" /> Asset QR
      </button>

      {status === "AVAILABLE" && (
        <button 
          onClick={() => setIsCheckoutOpen(true)}
          className="cat-btn-primary text-xs"
        >
          <LogOut className="w-3.5 h-3.5" /> Deploy Machine
        </button>
      )}

      {status === "ACTIVE" && (
        <button 
          onClick={() => setIsCheckinOpen(true)}
          className="cat-btn-secondary text-xs"
        >
          <LogIn className="w-3.5 h-3.5" /> Check In
        </button>
      )}

      {/* QR Code Modal */}
      {isQROpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151a21] border border-[#262d38] rounded-lg p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setIsQROpen(false)} className="absolute top-4 right-4 text-[#94a3b8] hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-center text-white uppercase tracking-wider">Cat VisionLink QR</h3>
            <p className="text-center text-[#ffcd11] mb-5 font-mono text-sm tracking-wider font-bold">{equipmentId}</p>
            <div className="flex justify-center mb-5 bg-white p-4 rounded mx-auto w-max shadow-inner">
              <QRCodeSVG 
                value={`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/equipment/${equipmentId}`} 
                size={190} 
              />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[#64748b] font-bold mb-1.5 uppercase tracking-wider">Digital Scan Link</p>
              <div className="flex items-center justify-between bg-[#0f1216] border border-[#262d38] rounded p-2 overflow-hidden">
                <span className="text-xs text-[#94a3b8] font-mono truncate mr-2">
                  {`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/equipment/${equipmentId}`}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/equipment/${equipmentId}`)}
                  className="cat-btn-primary text-[10px] py-1 px-2 shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151a21] border border-[#262d38] rounded-lg p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-[#94a3b8] hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black mb-5 text-white tracking-wide uppercase flex items-center gap-2">
              <LogOut className="text-[#ffcd11] w-4 h-4" /> Authorize Machine Deployment
            </h3>
            {error && <div className="p-3 mb-4 bg-red-950/30 border border-red-500/40 text-red-300 rounded text-xs">{error}</div>}
            
            <form onSubmit={handleCheckout} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-[#64748b] mb-1 uppercase tracking-wider">Operator ID</label>
                <input required type="text" value={opId} onChange={e => setOpId(e.target.value)} className="cat-input font-mono" placeholder="e.g. OP-842" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#64748b] mb-1 uppercase tracking-wider">Job Site Location ID</label>
                <input required type="text" value={siteId} onChange={e => setSiteId(e.target.value)} className="cat-input font-mono" placeholder="e.g. SITE-A" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#64748b] mb-1 uppercase tracking-wider">Initial Engine Hours</label>
                <input required type="number" step="0.1" min="0" value={startHours} onChange={e => setStartHours(e.target.value)} className="cat-input font-mono" placeholder="0.0" />
              </div>
              
              <div className="flex justify-end gap-2.5 pt-4">
                <button type="button" onClick={() => setIsCheckoutOpen(false)} disabled={loading} className="cat-btn-ghost text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="cat-btn-primary text-xs">
                  {loading ? "Authorizing..." : "Deploy Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkin Modal */}
      {isCheckinOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151a21] border border-[#262d38] rounded-lg p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsCheckinOpen(false)} className="absolute top-4 right-4 text-[#94a3b8] hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black mb-5 text-white tracking-wide uppercase flex items-center gap-2">
              <LogIn className="text-[#ffcd11] w-4 h-4" /> Check In &amp; Telemetry Log
            </h3>
            {error && <div className="p-3 mb-4 bg-red-950/30 border border-red-500/40 text-red-300 rounded text-xs">{error}</div>}
            
            <form onSubmit={handleCheckin} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-[#64748b] mb-1 uppercase tracking-wider">Final Engine Hours</label>
                <input required type="number" step="0.1" min="0" value={endHours} onChange={e => setEndHours(e.target.value)} className="cat-input font-mono" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#64748b] mb-1 uppercase tracking-wider">Total Idle Hours</label>
                <input required type="number" step="0.1" min="0" value={idleHours} onChange={e => setIdleHours(e.target.value)} className="cat-input font-mono" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#64748b] mb-1 uppercase tracking-wider">Telemetry &amp; Condition Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="cat-input resize-none h-20 text-xs font-mono" placeholder="Observations, fault flags, or return condition..."></textarea>
              </div>
              
              <div className="flex justify-end gap-2.5 pt-4">
                <button type="button" onClick={() => setIsCheckinOpen(false)} disabled={loading} className="cat-btn-ghost text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="cat-btn-primary text-xs">
                  {loading ? "Processing..." : "Confirm Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
