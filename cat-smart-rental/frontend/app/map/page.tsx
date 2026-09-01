import { getEquipmentList } from "@/lib/api";
import { FleetMap } from "@/components/map/FleetMap";
import { Radio, ShieldAlert, Layers, MapPin, Gauge, Globe, Satellite, ExternalLink } from "lucide-react";

export default async function MapPage() {
  try {
    const equipment = await getEquipmentList();
    const activeCount = equipment.filter((e) => e.status === "ACTIVE").length;

    return (
      <div className="max-w-7xl mx-auto space-y-8 cat-page-enter">
        {/* Header */}
        <div className="cat-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#ffcd11]/15 border border-[#ffcd11]/30 px-3 py-1 rounded text-[11px] font-black text-[#ffcd11] tracking-wider uppercase mb-2">
              <Globe className="w-3.5 h-3.5 text-[#ffcd11]" />
              Google Maps Telematics Integration
            </div>
            <h1 className="cat-section-heading text-xl">
              Google Maps Fleet <span className="accent">Control Tower</span>
            </h1>
            <p className="text-[#94a3b8] text-xs sm:text-sm mt-1">
              Live Google Satellite &amp; Terrain telematics, construction job site perimeter boundaries, and GPS coordinates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#34d399] bg-[#10b981]/15 px-3.5 py-2 rounded border border-emerald-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {activeCount} MACHINES ACTIVE ON SITES
            </span>
          </div>
        </div>

        {/* Interactive Google Maps Fleet Control */}
        <FleetMap equipment={equipment} />

        {/* Site Telemetry Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="cat-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-[#ffcd11] uppercase tracking-wider">
                <MapPin className="w-4 h-4" /> Silk Board Interchange (S001)
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=12.9176,77.6238"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-[#94a3b8] hover:text-[#ffcd11] flex items-center gap-1"
                title="View in Google Maps"
              >
                Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Bangalore Metro Phase 2 underground civil works. 4 active assets inside 800m geofence perimeter.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 font-bold">
              PERIMETER INTEGRITY: 100% SECURE
            </div>
          </div>

          <div className="cat-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-[#ffcd11] uppercase tracking-wider">
                <MapPin className="w-4 h-4" /> Kempegowda Airport T3 (S002)
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=13.1986,77.7066"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-[#94a3b8] hover:text-[#ffcd11] flex items-center gap-1"
                title="View in Google Maps"
              >
                Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Runway grading and foundation heavy excavation. 1,200m high-security geofenced corridor.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 font-bold">
              PERIMETER INTEGRITY: 100% SECURE
            </div>
          </div>

          <div className="cat-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-[#ffcd11] uppercase tracking-wider">
                <MapPin className="w-4 h-4" /> Outer Ring Road Hub (S006)
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=12.9352,77.6946"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-[#94a3b8] hover:text-[#ffcd11] flex items-center gap-1"
                title="View in Google Maps"
              >
                Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Logistics hub earthmoving. High idle ratio flags monitored in secondary yard zone.
            </p>
            <div className="text-[11px] font-mono text-amber-400 font-bold">
              MONITORING: 1 ASSET HIGH IDLE
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center bg-[#151a21] rounded-lg border border-red-500/40">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Map</h2>
        <p className="text-[#94a3b8] text-xs">Could not fetch equipment GPS telemetry.</p>
      </div>
    );
  }
}
