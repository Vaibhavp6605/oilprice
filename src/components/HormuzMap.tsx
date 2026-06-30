import { motion } from "framer-motion";
import { Ship, AlertTriangle, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDailySnapshots } from "@/hooks/useDailySnapshots";
import { useAisShips, type RefreshMode } from "@/hooks/useAisShips";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

// US / allied military bases in the region (real, public locations)
const usBases = [
  { name: "NSA Bahrain (5th Fleet HQ)", country: "🇧🇭 Bahrain", pos: [26.211, 50.609] as [number, number] },
  { name: "Al Udeid Air Base", country: "🇶🇦 Qatar", pos: [25.117, 51.315] as [number, number] },
  { name: "Al Dhafra Air Base", country: "🇦🇪 UAE", pos: [24.248, 54.547] as [number, number] },
  { name: "Fujairah Naval Base", country: "🇦🇪 UAE", pos: [25.171, 56.342] as [number, number] },
  { name: "Camp Arifjan", country: "🇰🇼 Kuwait", pos: [28.886, 48.108] as [number, number] },
  { name: "Thumrait Air Base", country: "🇴🇲 Oman", pos: [17.666, 54.025] as [number, number] },
];

// Deterministic hourly drift so warship positions "refresh" each hour without random jumps
const hourSeed = () => Math.floor(Date.now() / (60 * 60 * 1000));
const driftPos = (pos: [number, number], idx: number): [number, number] => {
  const h = hourSeed() + idx * 17;
  const dLat = (Math.sin(h * 1.3) * 0.06);
  const dLon = (Math.cos(h * 0.9) * 0.08);
  return [pos[0] + dLat, pos[1] + dLon];
};

const HormuzMap = () => {
  const { data: snapshots, dataUpdatedAt } = useDailySnapshots();
  const [refreshMode, setRefreshMode] = useState<RefreshMode>("cached");
  const { data: aisShips = [], dataUpdatedAt: aisUpdatedAt, isFetching: aisFetching } = useAisShips(refreshMode);
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

  const dockedShipIcon = divIcon(
    `<div style="
      width:10px;height:10px;
      background:hsl(38 92% 50%);
      border:1.5px solid #fff;
      box-shadow:0 0 8px 2px hsl(38 92% 50% / 0.8);
    "></div>`,
    10,
  );

  const blockadeShipIcon = divIcon(
    `<div style="
      width:12px;height:12px;border-radius:50%;
      background:hsl(0 84% 60%);
      border:1.5px solid #fff;
      box-shadow:0 0 12px 3px hsl(0 84% 60% / 0.9);
    "></div>`,
    12,
  );

  // Blockade zone center & radius (must match Circle below)
  const BLOCKADE_CENTER: [number, number] = [26.55, 56.25];
  const BLOCKADE_RADIUS_KM = 25;
  const distKm = (a: [number, number], b: [number, number]) => {
    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLon = (b[1] - a[1]) * Math.PI / 180;
    const lat1 = a[0] * Math.PI / 180, lat2 = b[0] * Math.PI / 180;
    const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(x));
  };
  const blockadeShips = aisShips.filter(s => distKm(BLOCKADE_CENTER, [s.lat, s.lon]) <= BLOCKADE_RADIUS_KM);

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
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-2 px-2 py-1 rounded-full bg-card border border-border"
            title={refreshMode === "live" ? "Streaming live AIS — refreshes every 20s" : "Cached snapshot — refreshes every 5 min"}
          >
            <Label htmlFor="live-toggle" className="text-[9px] sm:text-[10px] font-mono cursor-pointer select-none">
              {refreshMode === "live" ? (
                <span className="text-crisis-green flex items-center gap-1">
                  <Radio className={`h-2.5 w-2.5 ${aisFetching ? "animate-pulse" : ""}`} />
                  LIVE
                </span>
              ) : (
                <span className="text-muted-foreground">CACHED</span>
              )}
            </Label>
            <Switch
              id="live-toggle"
              checked={refreshMode === "live"}
              onCheckedChange={(c) => setRefreshMode(c ? "live" : "cached")}
            />
          </div>
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-mono bg-crisis-green/10 text-crisis-green border border-crisis-green/30"
            title="Live AIS vessel positions from aisstream.io. Updated every few seconds."
          >
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            <span>LIVE AIS • {aisShips.length} ships • {agoLabel}</span>
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
          zoom={9}
          minZoom={9}
          maxZoom={9}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          zoomControl={false}
          maxBounds={[[25.8, 55.4], [27.2, 57.1]]}
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

          {/* Live AIS ships — orange=docked (sog<0.5), red=in blockade, green=transiting */}
          {aisShips.map((s) => {
            const inBlockade = distKm(BLOCKADE_CENTER, [s.lat, s.lon]) <= BLOCKADE_RADIUS_KM;
            const isDocked = s.sog < 0.5;
            const icon = isDocked ? dockedShipIcon : inBlockade ? blockadeShipIcon : shipIcon;
            return (
              <Marker key={s.mmsi} position={[s.lat, s.lon]} icon={icon}>
                <Popup>
                  <strong>{s.name || `MMSI ${s.mmsi}`}</strong>
                  {isDocked && <> — <span style={{color:"#d97706"}}>⚓ docked / anchored</span></>}
                  {!isDocked && inBlockade && <> — <span style={{color:"#dc2626"}}>⛔ in blockade zone</span></>}
                  <br />
                  {s.sog.toFixed(1)} kn • {s.cog.toFixed(0)}°
                  <br />
                  <em style={{ fontSize: 10 }}>Live AIS · aisstream.io</em>
                </Popup>
              </Marker>
            );
          })}

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

        {/* Legend */}
        <div className="absolute top-3 right-3 z-[400] bg-black/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10 text-white text-[9px] sm:text-[10px] space-y-1.5">
          <div className="font-bold uppercase tracking-wider text-white/70 mb-1">Legend</div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-crisis-green shadow-[0_0_6px_hsl(142_71%_45%)]" />
            <span>Transiting vessel (AIS)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-amber-500 border border-white" />
            <span>Docked / anchored</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-crisis-red border border-white shadow-[0_0_6px_hsl(0_84%_60%)]" />
            <span>In blockade zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-crisis-blue border border-white rotate-45 shadow-[0_0_6px_hsl(217_91%_60%)]" />
            <span>🇺🇸 US Navy warship</span>
          </div>
        </div>
      </div>


      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-card border-t border-border text-[9px] sm:text-[10px] text-muted-foreground">
        ✅ Vessel dots are <strong>live AIS</strong> (aisstream.io) — real MMSI, position, speed & course. US Navy diamonds are approximate operating areas (no public military AIS). Pre-war baseline: {prewarShips} ships/day.
      </div>
    </motion.div>
  );
};

export default HormuzMap;
