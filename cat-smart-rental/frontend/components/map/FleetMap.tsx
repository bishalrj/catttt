"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Truck,
  MapPin,
  Radio,
  Layers,
  ArrowRight,
  ExternalLink,
  Satellite,
  Compass,
  Navigation,
  Globe,
  Focus,
} from "lucide-react";
import { Equipment } from "@/lib/types";
import "leaflet/dist/leaflet.css";

// Standard coordinates for Bangalore construction job sites
const SITE_LOCATIONS: Record<
  string,
  { name: string; lat: number; lng: number; radius: number; polygon: [number, number][] }
> = {
  S001: {
    name: "Bangalore Metro Phase 2 (Silk Board)",
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
    name: "Whitefield Tech Park Infrastructure",
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
    name: "Electronic City Expressway Corridor",
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

type MapLayerType = "google-hybrid" | "google-road" | "google-terrain" | "cat-dark";

const MAP_LAYERS: Record<MapLayerType, { name: string; url: string; subdomains?: string; maxZoom: number; attribution: string }> = {
  "google-hybrid": {
    name: "Google Satellite (Hybrid)",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    maxZoom: 20,
    attribution: "&copy; Google Maps &copy; Caterpillar VisionLink",
  },
  "google-road": {
    name: "Google Maps Standard",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    maxZoom: 20,
    attribution: "&copy; Google Maps &copy; Caterpillar VisionLink",
  },
  "google-terrain": {
    name: "Google Terrain / Elevation",
    url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    maxZoom: 20,
    attribution: "&copy; Google Maps &copy; Caterpillar VisionLink",
  },
  "cat-dark": {
    name: "Cat Industrial Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    maxZoom: 19,
    attribution: "&copy; CARTO &copy; Caterpillar VisionLink",
  },
};

interface FleetMapProps {
  equipment: Equipment[];
}

export function FleetMap({ equipment }: FleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentLayer, setCurrentLayer] = useState<MapLayerType>("google-hybrid");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showGeofences, setShowGeofences] = useState(true);

  // Initialize Map
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

      // Add Active Google / Cat Tile Layer
      const layerConfig = MAP_LAYERS[currentLayer];
      const tileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        subdomains: layerConfig.subdomains || "",
        maxZoom: layerConfig.maxZoom,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;

      // Draw Job Site Geofence Polygons
      Object.entries(SITE_LOCATIONS).forEach(([siteId, site]) => {
        if (showGeofences) {
          const polygon = L.polygon(site.polygon, {
            color: "#ffcd11",
            weight: 2,
            fillColor: "#ffcd11",
            fillOpacity: currentLayer === "google-hybrid" ? 0.15 : 0.08,
            dashArray: "5, 5",
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
        const lat = site ? site.lat + ((idx % 3) - 1) * 0.004 : 12.9750 + idx * 0.005;
        const lng = site ? site.lng + (idx % 2 === 0 ? 0.004 : -0.004) : 77.6000 + idx * 0.006;

        const color =
          eq.status === "ACTIVE"
            ? "#ffcd11"
            : eq.status === "AVAILABLE"
            ? "#10b981"
            : eq.status === "OVERDUE"
            ? "#ef4444"
            : "#f59e0b";

        const customIcon = L.divIcon({
          className: "cat-custom-marker",
          html: `
            <div style="
              background: #0b0d10;
              border: 2px solid ${color};
              color: ${color};
              width: 36px;
              height: 36px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: monospace;
              font-weight: 900;
              font-size: 11px;
              box-shadow: 0 0 16px ${color}99;
              cursor: pointer;
            ">
              ${eq.equipment_type.slice(0, 3).toUpperCase()}
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.on("click", () => {
          setSelectedEq(eq);
          setSelectedCoords({ lat, lng });
          map.setView([lat, lng], 14, { animate: true });
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
  }, [equipment, filterType, filterStatus, showGeofences, currentLayer]);

  const displayedCount = equipment.filter((eq) => {
    if (filterType !== "ALL" && eq.equipment_type !== filterType) return false;
    if (filterStatus !== "ALL" && eq.status !== filterStatus) return false;
    return true;
  }).length;

  function flyToSite(siteId: string) {
    if (!mapInstanceRef.current || !SITE_LOCATIONS[siteId]) return;
    const site = SITE_LOCATIONS[siteId];
    mapInstanceRef.current.setView([site.lat, site.lng], 14, { animate: true });
  }

  return (
    <div className="relative w-full h-[680px] rounded-lg border border-[#262d38] overflow-hidden bg-[#0f1216] shadow-2xl flex flex-col">
      {/* Top Controls & Google Maps Layer Switcher */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-[#151a21]/95 backdrop-blur-md p-3.5 rounded-lg border border-[#262d38] shadow-2xl">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Google Maps Layer Dropdown */}
          <div className="flex items-center gap-2 bg-[#12161c] px-3 py-1.5 rounded border border-[#ffcd11]/40 shadow-inner">
            <Globe className="w-4 h-4 text-[#ffcd11]" />
            <select
              value={currentLayer}
              onChange={(e) => setCurrentLayer(e.target.value as MapLayerType)}
              className="bg-transparent text-[#ffcd11] text-xs font-black uppercase outline-none cursor-pointer tracking-wider"
            >
              <option value="google-hybrid" className="bg-[#151a21] text-white">🛰️ Google Satellite (Hybrid)</option>
              <option value="google-road" className="bg-[#151a21] text-white">🗺️ Google Maps Standard</option>
              <option value="google-terrain" className="bg-[#151a21] text-white">⛰️ Google Terrain / Elevation</option>
              <option value="cat-dark" className="bg-[#151a21] text-white">🌑 Cat Industrial Dark</option>
            </select>
          </div>

          {/* Quick Fly-To Site */}
          <div className="flex items-center gap-1.5 bg-[#12161c] px-2.5 py-1.5 rounded border border-[#262d38]">
            <Focus className="w-3.5 h-3.5 text-[#64748b]" />
            <select
              onChange={(e) => {
                if (e.target.value) flyToSite(e.target.value);
              }}
              defaultValue=""
              className="bg-transparent text-xs text-[#94a3b8] font-bold outline-none cursor-pointer uppercase"
            >
              <option value="" disabled className="bg-[#151a21] text-slate-400">Fly to Job Site…</option>
              {Object.entries(SITE_LOCATIONS).map(([id, s]) => (
                <option key={id} value={id} className="bg-[#151a21] text-white">
                  Site {id}: {s.name}
                </option>
              ))}
            </select>
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
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#ffcd11] font-black bg-[#12161c] px-3 py-1 rounded border border-[#262d38]">
            {displayedCount} ASSETS LIVE
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Selected Equipment Drawer */}
      {selectedEq && selectedCoords && (
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-[420px] z-20 bg-[#151a21]/95 backdrop-blur-lg border border-[#ffcd11] rounded-lg p-5 shadow-2xl space-y-4 cat-page-enter">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded bg-[#181d24] border border-[#ffcd11] flex items-center justify-center shrink-0">
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
              <span className="text-[10px] font-bold text-[#64748b] uppercase block mb-0.5">Job Site Location</span>
              <span className="font-mono font-bold text-white text-xs">{selectedEq.site_id || "CENTRAL DEPOT"}</span>
            </div>
            <div className="bg-[#12161c] p-2.5 rounded border border-[#262d38]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase block mb-0.5">Telemetry Status</span>
              <span className="font-mono font-bold text-[#ffcd11] text-xs">{selectedEq.status}</span>
            </div>
            <div className="bg-[#12161c] p-2.5 rounded border border-[#262d38]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase block mb-0.5">GPS Latitude</span>
              <span className="font-mono text-[#94a3b8] text-xs">{selectedCoords.lat.toFixed(5)}</span>
            </div>
            <div className="bg-[#12161c] p-2.5 rounded border border-[#262d38]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase block mb-0.5">GPS Longitude</span>
              <span className="font-mono text-[#94a3b8] text-xs">{selectedCoords.lng.toFixed(5)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-[#262d38]">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedCoords.lat},${selectedCoords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cat-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
            </a>
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
