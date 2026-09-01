"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Truck, MapPin, Radio, ShieldAlert, Activity, ArrowRight, Gauge, Layers, Eye } from "lucide-react";
import { Equipment } from "@/lib/types";
import "leaflet/dist/leaflet.css";

// Standard coordinates for Bangalore construction job sites
const SITE_LOCATIONS: Record<string, { name: string; lat: number; lng: number; radius: number; polygon: [number, number][] }> = {
  S001: {
    name: "Bangalore Metro Phase 2 (Silk Board Interchange)",
    lat: 12.9176,
    lng: 77.6238,
    radius: 800,
    polygon: [
      [12.923, 77.618],
      [12.925, 77.630],
      [12.910, 77.631],
      [12.909, 77.619],
    ],
  },
  S002: {
    name: "Kempegowda Airport Terminal 3 Expansion",
    lat: 13.1986,
    lng: 77.7066,
    radius: 1200,
    polygon: [
      [13.208, 77.695],
      [13.210, 77.720],
      [13.187, 77.722],
      [13.185, 77.697],
    ],
  },
  S003: {
    name: "Whitefield Tech Park Infrastructure Corridor",
    lat: 12.9698,
    lng: 77.7499,
    radius: 750,
    polygon: [
      [12.976, 77.742],
      [12.977, 77.758],
      [12.963, 77.757],
      [12.962, 77.741],
    ],
  },
  S004: {
    name: "Electronic City Expressway Maintenance",
    lat: 12.8452,
    lng: 77.6602,
    radius: 900,
    polygon: [
      [12.853, 77.651],
      [12.855, 77.670],
      [12.837, 77.669],
      [12.835, 77.652],
    ],
  },
  S006: {
    name: "Outer Ring Road Heavy Logistics Hub",
    lat: 12.9352,
    lng: 77.6946,
    radius: 850,
    polygon: [
      [12.943, 77.686],
      [12.945, 77.703],
      [12.926, 77.704],
      [12.925, 77.687],
    ],
  },
};

interface FleetMapProps {
  equipment: Equipment[];
}

export function FleetMap({ equipment }: FleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showGeofences, setShowGeofences] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let L: any;
    let isCancelled = false;

    const initMap = async () => {
      L = (await import("leaflet")).default;
      if (isCancelled || !mapContainerRef.current) return;

      // Clean existing map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered on Bangalore region
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.6413],
        zoom: 11,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Dark Caterpillar theme tiles (CartoDB Dark Matter)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; Cat VisionLink',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Draw Job Site Geofence Polygons
      Object.entries(SITE_LOCATIONS).forEach(([siteId, site]) => {
        if (showGeofences) {
          const polygon = L.polygon(site.polygon, {
            color: "#ffcd11",
            weight: 1.5,
            fillColor: "#ffcd11",
            fillOpacity: 0.08,
            dashArray: "4, 4",
          }).addTo(map);

          polygon.bindTooltip(`📍 <strong>Site ${siteId}</strong>: ${site.name}`, {
            permanent: false,
            direction: "top",
            className: "cat-map-tooltip",
          });
        }
      });

      // Filtered equipment markers
      const displayed = equipment.filter((eq) => {
        if (filterType !== "ALL" && eq.equipment_type !== filterType) return false;
        if (filterStatus !== "ALL" && eq.status !== filterStatus) return false;
        return true;
      });

      displayed.forEach((eq, idx) => {
        const site = eq.site_id && SITE_LOCATIONS[eq.site_id] ? SITE_LOCATIONS[eq.site_id] : null;
        
        // Coordinates: located within site geofence with jitter or central staging hub
        const lat = site ? site.lat + ((idx % 3) - 1) * 0.004 : 12.9750 + idx * 0.005;
        const lng = site ? site.lng + (idx % 2 === 0 ? 0.004 : -0.004) : 77.6000 + idx * 0.006;

        const color = eq.status === "ACTIVE" ? "#ffcd11" : eq.status === "AVAILABLE" ? "#10b981" : eq.status === "OVERDUE" ? "#ef4444" : "#f59e0b";

        const customIcon = L.divIcon({
          className: "cat-custom-marker",
          html: `
            <div style="
              background: #0b0d10;
              border: 2px solid ${color};
              color: ${color};
              width: 34px;
              height: 34px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: monospace;
              font-weight: 900;
              font-size: 11px;
              box-shadow: 0 0 14px ${color}88;
              cursor: pointer;
            ">
              ${eq.equipment_type.slice(0, 3).toUpperCase()}
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.on("click", () => {
          setSelectedEq(eq);
          map.setView([lat, lng], 13, { animate: true });
        });
      });
    };

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [equipment, filterType, filterStatus, showGeofences]);

  const displayedCount = equipment.filter((eq) => {
    if (filterType !== "ALL" && eq.equipment_type !== filterType) return false;
    if (filterStatus !== "ALL" && eq.status !== filterStatus) return false;
    return true;
  }).length;

  return (
    <div className="relative w-full h-[650px] rounded-lg border border-[#262d38] overflow-hidden bg-[#0f1216] shadow-2xl flex flex-col">
      {/* Top Filter & Control Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2.5 bg-[#151a21]/95 backdrop-blur-md p-3 rounded-lg border border-[#262d38] shadow-2xl">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#12161c] rounded border border-[#ffcd11]/30 text-xs font-mono font-bold text-[#ffcd11]">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#ffcd11]" />
          <span>LIVE GPS TELEMETRICS</span>
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#12161c] border border-[#262d38] text-[#f8fafc] text-xs rounded px-3 py-1.5 outline-none font-bold uppercase cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active (Operational)</option>
          <option value="AVAILABLE">Available (Ready)</option>
          <option value="OVERDUE">Overdue</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>

        {/* Equipment Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-[#12161c] border border-[#262d38] text-[#f8fafc] text-xs rounded px-3 py-1.5 outline-none font-bold uppercase cursor-pointer"
        >
          <option value="ALL">All Machinery</option>
          <option value="Excavator">Excavator</option>
          <option value="Bulldozer">Bulldozer</option>
          <option value="Crane">Crane</option>
          <option value="Grader">Grader</option>
        </select>

        {/* Geofence Toggle */}
        <button
          onClick={() => setShowGeofences(!showGeofences)}
          className={`text-xs px-3 py-1.5 rounded border font-bold uppercase transition-all flex items-center gap-1.5 ${
            showGeofences
              ? "bg-[#ffcd11]/20 text-[#ffcd11] border-[#ffcd11]/40"
              : "bg-[#12161c] text-[#64748b] border-[#262d38]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Geofences
        </button>

        <span className="text-[11px] font-mono text-[#94a3b8] px-2 font-bold">
          {displayedCount} ASSETS
        </span>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Selected Equipment Flyout */}
      {selectedEq && (
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-96 z-20 bg-[#151a21]/95 backdrop-blur-lg border border-[#ffcd11] rounded-lg p-5 shadow-2xl space-y-3.5 cat-page-enter">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded bg-[#181d24] border border-[#ffcd11] flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#ffcd11]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748b] block font-bold">ASSET #{selectedEq.equipment_id}</span>
                <h4 className="text-sm font-black text-white uppercase tracking-wide">{selectedEq.equipment_type}</h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedEq(null)}
              className="text-[#64748b] hover:text-white text-xs font-bold px-2 py-1 rounded bg-[#12161c] border border-[#262d38]"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#12161c] p-2.5 rounded border border-[#262d38]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase block mb-0.5">Job Site</span>
              <span className="font-mono font-bold text-white text-xs">{selectedEq.site_id || "UNASSIGNED"}</span>
            </div>
            <div className="bg-[#12161c] p-2.5 rounded border border-[#262d38]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase block mb-0.5">Telemetry Status</span>
              <span className="font-mono font-bold text-[#ffcd11] text-xs">{selectedEq.status}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#262d38]">
            <span className="text-[#94a3b8] font-mono text-xs">
              Daily Engine: <strong className="text-white">{selectedEq.engine_hours_per_day.toFixed(1)}h</strong>
            </span>
            <Link
              href={`/equipment/${selectedEq.equipment_id}`}
              className="cat-btn-primary text-xs py-1.5 px-3.5"
            >
              Live Telematics &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
