import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const REGIONS = [
  { name: "Japan", dep: 90, level: "CRITICAL", note: "90%+ oil dependency; severe energy shortage" },
  { name: "South Korea", dep: 80, level: "CRITICAL", note: "80%+ oil dependency; critical LNG importer" },
  { name: "India", dep: 60, level: "HIGH", note: "60% oil dependency; significant economic impact" },
  { name: "China", dep: 40, level: "HIGH", note: "40% oil dependency; diversifying routes" },
  { name: "EU", dep: 20, level: "MODERATE", note: "20% oil dependency; alternatives available" },
  { name: "United States", dep: 15, level: "HIGH", note: "Inflation and fuel costs driven higher" },
];

const levelColor = (l: string) =>
  l === "CRITICAL" ? "bg-crisis-red/20 text-crisis-red border-crisis-red/40"
  : l === "HIGH" ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
  : "bg-crisis-blue/20 text-crisis-blue border-crisis-blue/40";

const RegionalHeatmap = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card overflow-hidden">
    <div className="p-3 sm:p-4 border-b border-border">
      <h3 className="text-sm sm:text-lg font-semibold flex items-center gap-2">
        <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-crisis-blue" />
        Regional Impact Heatmap
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Oil dependency on Hormuz transit</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 sm:p-4">
      {REGIONS.map((r) => (
        <div key={r.name} className={`rounded-lg border p-3 ${levelColor(r.level)}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">{r.name}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30">{r.level}</span>
          </div>
          <div className="font-mono text-2xl font-bold mt-1">{r.dep}%</div>
          <div className="w-full bg-black/30 rounded-full h-1.5 mt-1">
            <div className="h-1.5 rounded-full bg-current" style={{ width: `${r.dep}%` }} />
          </div>
          <p className="text-[10px] mt-2 opacity-80 leading-tight">{r.note}</p>
        </div>
      ))}
    </div>
    <div className="px-3 py-2 bg-card border-t border-border text-[9px] sm:text-[10px] text-muted-foreground">
      Sources: IEA, EIA, BP Statistical Review of World Energy
    </div>
  </motion.div>
);

export default RegionalHeatmap;
