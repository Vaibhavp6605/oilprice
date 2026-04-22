import { motion } from "framer-motion";
import { Ship, AlertTriangle, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { useDailySnapshots } from "@/hooks/useDailySnapshots";
import hormuzSatellite from "@/assets/hormuz-satellite.jpg";

const HormuzMap = () => {
  const { data: snapshots, dataUpdatedAt } = useDailySnapshots();
  const allData = snapshots || [];
  const latest = allData[allData.length - 1];
  const prewar = allData.find((d) => d.war_day === -1) || allData[0];

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!latest || !prewar) return null;

  const secsAgo = Math.max(0, Math.floor((now - dataUpdatedAt) / 1000));
  const agoLabel =
    secsAgo < 60 ? `${secsAgo}s ago` : `${Math.floor(secsAgo / 60)}m ${secsAgo % 60}s ago`;

  const currentShips = latest.strait_hormuz_daily_ships;
  const prewarShips = prewar.strait_hormuz_daily_ships;
  const blockadePct = ((1 - currentShips / prewarShips) * 100).toFixed(1);
  const isBlocked = currentShips < 10;

  // Generate animated ship dots (few active, many "stuck")
  const activeShips = Array.from({ length: Math.min(currentShips, 5) }, (_, i) => ({
    id: `active-${i}`,
    x: 42 + Math.random() * 16,
    y: 38 + Math.random() * 24,
    active: true,
  }));

  const stuckShips = Array.from({ length: Math.min(12, prewarShips - currentShips) }, (_, i) => ({
    id: `stuck-${i}`,
    x: i < 6 ? 15 + Math.random() * 20 : 65 + Math.random() * 20,
    y: 20 + Math.random() * 60,
    active: false,
  }));

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
            <span className="hidden sm:inline">Strait of Hormuz — Live Blockade Map</span>
            <span className="sm:hidden">Hormuz Blockade Map</span>
          </h3>
          <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5">
            Satellite view • Ship traffic overlay
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-mono bg-crisis-green/10 text-crisis-green border border-crisis-green/30">
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            <span>LIVE • {agoLabel}</span>
            <span className="hidden sm:inline opacity-60">• 5min</span>
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

      <div className="relative aspect-[4/3] sm:aspect-[16/9] max-h-[420px] overflow-hidden">
        {/* Satellite background */}
        <img
          src={hormuzSatellite}
          alt="Satellite view of the Strait of Hormuz"
          className="w-full h-full object-cover"
          loading="lazy"
          width={1280}
          height={720}
        />

        {/* Dark overlay for data visibility */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Blockade zone - red pulsing area across the strait */}
        {isBlocked && (
          <motion.div
            className="absolute"
            style={{ left: "38%", top: "30%", width: "24%", height: "40%" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-full h-full rounded-full bg-crisis-red/30 border-2 border-crisis-red/50 border-dashed" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-crisis-red text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
              ⛔ Blockade Zone
            </div>
          </motion.div>
        )}

        {/* Active ships passing through */}
        {activeShips.map((ship) => (
          <motion.div
            key={ship.id}
            className="absolute"
            style={{ left: `${ship.x}%`, top: `${ship.y}%` }}
            animate={{ x: [0, 8, 0], y: [0, -4, 0] }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity }}
          >
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-crisis-green shadow-[0_0_8px_2px_hsl(142,71%,45%)]" />
            </div>
          </motion.div>
        ))}

        {/* Stuck/anchored ships */}
        {stuckShips.map((ship) => (
          <motion.div
            key={ship.id}
            className="absolute"
            style={{ left: `${ship.x}%`, top: `${ship.y}%` }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
          >
            <div className="h-2 w-2 rounded-full bg-crisis-amber/60 border border-crisis-amber/40" />
          </motion.div>
        ))}

        {/* Labels */}
        <div className="absolute top-[15%] left-[20%] text-[9px] sm:text-[11px] font-bold text-white/80 tracking-wider">
          IRAN
        </div>
        <div className="absolute bottom-[15%] right-[25%] text-[9px] sm:text-[11px] font-bold text-white/80 tracking-wider">
          UAE / OMAN
        </div>
        <div className="hidden sm:block absolute top-[8%] left-[8%] text-[10px] text-white/50 tracking-wider">
          PERSIAN GULF ←
        </div>
        <div className="hidden sm:block absolute bottom-[8%] right-[8%] text-[10px] text-white/50 tracking-wider">
          → GULF OF OMAN
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2 max-w-[70%] sm:max-w-none">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10">
            <div className="text-[8px] sm:text-[10px] text-white/60 uppercase tracking-wider">Ships</div>
            <div className="font-mono text-base sm:text-xl font-bold text-crisis-red">{currentShips}</div>
            <div className="text-[8px] sm:text-[10px] text-white/40">Norm: {prewarShips}</div>
          </div>
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10">
            <div className="text-[8px] sm:text-[10px] text-white/60 uppercase tracking-wider">Blockade</div>
            <div className="font-mono text-base sm:text-xl font-bold text-crisis-red">{blockadePct}%</div>
            <div className="text-[8px] sm:text-[10px] text-white/40">Reduction</div>
          </div>
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10">
            <div className="text-[8px] sm:text-[10px] text-white/60 uppercase tracking-wider">Day</div>
            <div className="font-mono text-base sm:text-xl font-bold text-white">{latest.war_day}</div>
            <div className="text-[8px] sm:text-[10px] text-white/40">{latest.phase}</div>
          </div>
        </div>

        {/* Legend - hidden on very small screens */}
        <div className="hidden sm:block absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
          <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Legend</div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-crisis-green shadow-[0_0_4px_1px_hsl(142,71%,45%)]" />
            <span className="text-[10px] text-white/70">Active transit</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-crisis-amber/60 border border-crisis-amber/40" />
            <span className="text-[10px] text-white/70">Anchored / waiting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-crisis-red/50 border border-dashed border-crisis-red/60" />
            <span className="text-[10px] text-white/70">Blockade zone</span>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-card border-t border-border text-[9px] sm:text-[10px] text-muted-foreground">
        Sources: Statista, Windward, BBC Verify, HormuzTracker • Baseline: {prewarShips} ships/day
      </div>
    </motion.div>
  );
};

export default HormuzMap;
