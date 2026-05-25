import { motion } from "framer-motion";
import { Route } from "lucide-react";

const ROUTES = [
  { name: "Cape of Good Hope", capacity: "Variable", delay: "+12 days", cost: "+$650k", desc: "Heavily used; significant vessel diversion underway. Adds 12 days to voyage and reduces capacity utilization." },
  { name: "UAE Habshan-Fujairah Pipeline", capacity: "1.5 mbpd", delay: "—", cost: "Operational", desc: "Existing pipeline bypasses the strait; expansion 50% complete, will double capacity by 2027." },
  { name: "Saudi East-West Pipeline", capacity: "5 mbpd", delay: "—", cost: "Saudi-only", desc: "5 mbpd capacity but Saudi-only access; limited ability to expand to other Gulf producers." },
];

const AlternativeRoutes = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card overflow-hidden">
    <div className="p-3 sm:p-4 border-b border-border">
      <h3 className="text-sm sm:text-lg font-semibold flex items-center gap-2">
        <Route className="h-4 w-4 sm:h-5 sm:w-5 text-crisis-green" />
        Alternative Routes
      </h3>
    </div>
    <div className="divide-y divide-border">
      {ROUTES.map((r) => (
        <div key={r.name} className="p-3 sm:p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="font-semibold text-sm">{r.name}</div>
            <div className="flex gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-muted">{r.capacity}</span>
              {r.delay !== "—" && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">{r.delay}</span>}
              <span className="px-2 py-0.5 rounded bg-crisis-red/10 text-crisis-red">{r.cost}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{r.desc}</p>
        </div>
      ))}
    </div>
    <div className="px-3 py-2 bg-card border-t border-border text-[9px] sm:text-[10px] text-muted-foreground">
      Sources: IEA Oil Market Report, ADNOC, Saudi Aramco disclosures
    </div>
  </motion.div>
);

export default AlternativeRoutes;
