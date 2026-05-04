import { motion } from "framer-motion";
import { Ship, AlertTriangle, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDailySnapshots } from "@/hooks/useDailySnapshots";
import { useAisShips } from "@/hooks/useAisShips";

// Fix default marker icons (Leaflet + bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const divIcon = (html: string, size = 18) =>
  L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

// Real coordinates — Strait of Hormuz
const STRAIT_CENTER: [number, number] = [26.5667, 56.25];

// Traffic Separation Scheme (approximate inbound/outbound lanes through the Strait)
const SHIPPING_LANE: [number, number][] = [
  [26.95, 56.95], // Gulf of Oman entrance
  [26.75, 56.55],
  [26.55, 56.25], // narrowest point near Larak Island
  [26.45, 55.95],
  [26.30, 55.55], // Persian Gulf side
];

// US Navy 5th Fleet — approx published operating areas (NOT real-time AIS)
const usWarships = [
  { name: "USS Carl Vinson", type: "Aircraft Carrier", pos: [25.4, 57.3] as [number, number] },
  { name: "USS Truxtun", type: "Destroyer (DDG-103)", pos: [25.7, 57.0] as [number, number] },
  { name: "USS W.P. Lawrence", type: "Destroyer (DDG-110)", pos: [25.1, 57.6] as [number, number] },
  { name: "USS Bataan", type: "Amphibious (LHD-5)", pos: [25.9, 57.8] as [number, number] },
  { name: "USS Vella Gulf", type: "Cruiser (CG-72)", pos: [24.8, 57.1] as [number, number] },
];

const HormuzMap = () => {
  const { data: snapshots, dataUpdatedAt } = useDailySnapshots();
  const { data: aisShips = [] } = useAisShips();
  const allData = snapshots || [];
  const latest = allData[allData.length - 1];
  const prewar = allData.find((d) => d.war_day === -1) || allData[0];

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  if (!latest || !prewar) return null;

  const minsAgo = Math.max(0, Math.floor((now - dataUpdatedAt) / 60000));
  const agoLabel = minsAgo < 1 ? "just now" : `${minsAgo}m ago`;

  // NASA GIBS publishes MODIS imagery for "yesterday" (UTC) once it's fully composited
  const gibsDate = (() => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const currentShips = latest.strait_hormuz_daily_ships;
  const prewarShips = prewar.strait_hormuz_daily_ships;
  const blockadePct = ((1 - currentShips / prewarShips) * 100).toFixed(1);
  const isBlocked = currentShips < 10;

  const warshipIcon = (isCarrier: boolean) =>
    divIcon(
      `<div style="
        width:${isCarrier ? 14 : 11}px;height:${isCarrier ? 14 : 11}px;
        background:hsl(217 91% 60%);border:1.5px solid #fff;
        transform:rotate(45deg);
        box-shadow:0 0 10px 2px hsl(217 91% 60% / 0.7);
      "></div>`,
      isCarrier ? 14 : 11,
    );

  const shipIcon = divIcon(
    `<div style="
      width:10px;height:10px;border-radius:50%;
      background:hsl(142 71% 45%);
      box-shadow:0 0 8px 2px hsl(142 71% 45% / 0.8);
    "></div>`,
    10,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="rounded-lg border border-border bg-card overflow-hidden"
    >
      <div className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <Ship className="h-4 w-4 sm:h-5 sm:w-5 text-crisis-blue" />
            <span className="hidden sm:inline">Strait of Hormuz — Live Geographic Map</span>
            <span className="sm:hidden">Hormuz Map</span>
          </h3>
          <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5">
            Real coordinates • Esri / OSM tiles • Pan & zoom
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-mono bg-crisis-amber/10 text-crisis-amber border border-crisis-amber/30"
            title="Map tiles are real. Ship counts and warship positions are AI estimates refreshed hourly — no free public real-time AIS feed exists for the Strait."
          >
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            <span>AI ESTIMATE • {agoLabel}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold ${
            isBlocked
              ? "bg-crisis-red/20 text-crisis-red border border-crisis-red/30"
              : "bg-crisis-green/20 text-crisis-green border border-crisis-green/30"
          }`}>
            <AlertTriangle className="h-3 w-3" />
            {isBlocked ? "BLOCKED" : "LIMITED TRANSIT"}
          </div>
        </div>
      </div>

      <div className="relative h-[60vh] min-h-[400px] lg:h-[70vh] lg:max-h-[800px]">
        <MapContainer
          center={STRAIT_CENTER}
          zoom={8}
          minZoom={6}
          maxZoom={13}
          scrollWheelZoom
          style={{ height: "100%", width: "100%", background: "#0a1929" }}
        >
          {/* NASA GIBS — MODIS Terra true-color, refreshed daily (yesterday for full coverage) */}
          <TileLayer
            attribution='Imagery © NASA EOSDIS GIBS — MODIS Terra (daily)'
            url={`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`}
            maxNativeZoom={9}
            maxZoom={13}
            tileSize={256}
          />
          {/* High-res Esri imagery overlay for closer zooms */}
          <TileLayer
            attribution='Tiles © Esri — Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            opacity={0.85}
            minZoom={10}
          />
          <TileLayer
            attribution='Labels © Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          />

          {/* Shipping lane */}
          <Polyline
            positions={SHIPPING_LANE}
            pathOptions={{ color: "hsl(142 71% 45%)", weight: 3, opacity: 0.7, dashArray: "6 6" }}
          />

          {/* Blockade zone — narrowest choke point */}
          {isBlocked && (
            <Circle
              center={[26.55, 56.25]}
              radius={25000}
              pathOptions={{
                color: "hsl(0 84% 60%)",
                fillColor: "hsl(0 84% 60%)",
                fillOpacity: 0.2,
                weight: 2,
                dashArray: "8 6",
              }}
            >
              <Popup>
                <strong>⛔ Blockade Zone</strong>
                <br />
                {blockadePct}% reduction in transit
                <br />
                {currentShips} of {prewarShips} normal ships/day
              </Popup>
            </Circle>
          )}

          {/* Active ships along the lane */}
          {/* Live AIS ships from aisstream.io */}
          {aisShips.map((s) => (
            <Marker key={s.mmsi} position={[s.lat, s.lon]} icon={shipIcon}>
              <Popup>
                <strong>{s.name || `MMSI ${s.mmsi}`}</strong>
                <br />
                {s.sog.toFixed(1)} kn • {s.cog.toFixed(0)}°
                <br />
                <em style={{ fontSize: 10 }}>Live AIS · aisstream.io</em>
              </Popup>
            </Marker>
          ))}

          {/* US Navy warships */}
          {usWarships.map((ws) => (
            <Marker
              key={ws.name}
              position={ws.pos}
              icon={warshipIcon(ws.type.includes("Carrier"))}
            >
              <Popup>
                🇺🇸 <strong>{ws.name}</strong>
                <br />
                {ws.type}
                <br />
                <em style={{ fontSize: 10 }}>Approx. operating area (not real-time AIS)</em>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Stats overlay */}
        <div className="absolute bottom-3 left-3 z-[400] flex flex-wrap gap-1.5 sm:gap-2 max-w-[70%] pointer-events-none">
          <div className="bg-black/75 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10">
            <div className="text-[8px] sm:text-[10px] text-white/60 uppercase tracking-wider">Ships</div>
            <div className="font-mono text-base sm:text-xl font-bold text-crisis-red">{currentShips}</div>
            <div className="text-[8px] sm:text-[10px] text-white/40">Norm: {prewarShips}</div>
          </div>
          <div className="bg-black/75 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10">
            <div className="text-[8px] sm:text-[10px] text-white/60 uppercase tracking-wider">Blockade</div>
            <div className="font-mono text-base sm:text-xl font-bold text-crisis-red">{blockadePct}%</div>
            <div className="text-[8px] sm:text-[10px] text-white/40">Reduction</div>
          </div>
          <div className="bg-black/75 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10">
            <div className="text-[8px] sm:text-[10px] text-white/60 uppercase tracking-wider">Day</div>
            <div className="font-mono text-base sm:text-xl font-bold text-white">{latest.war_day}</div>
            <div className="text-[8px] sm:text-[10px] text-white/40">{latest.phase}</div>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-card border-t border-border text-[9px] sm:text-[10px] text-muted-foreground">
        ⚠ Map is real geography (Esri/OSM). Ship & warship markers are <strong>AI estimates</strong> refreshed hourly from news (Reuters, BBC, Kpler). Real-time AIS requires a paid feed (MarineTraffic, Windward, Spire). Pre-war baseline: {prewarShips} ships/day.
      </div>
    </motion.div>
  );
};

export default HormuzMap;
