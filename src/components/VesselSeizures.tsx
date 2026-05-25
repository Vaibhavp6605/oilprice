import { motion } from "framer-motion";
import { Anchor } from "lucide-react";

type Seizure = {
  date: string;
  actor: "Iran (IRGC)" | "United States" | "United Kingdom";
  vessel: string;
  flag: string;
  desc: string;
  retaliation?: string;
  status: string;
};

const SEIZURES: Seizure[] = [
  { date: "Apr 21, 2026", actor: "Iran (IRGC)", vessel: "MSC Francesca", flag: "Panama", desc: "Container ship fired upon and seized in Strait of Hormuz", retaliation: "US naval blockade of Iran", status: "Currently held" },
  { date: "Apr 21, 2026", actor: "Iran (IRGC)", vessel: "Epaminodes", flag: "Greece", desc: "Container ship fired upon and seized in Strait of Hormuz", retaliation: "US naval blockade of Iran", status: "Currently held" },
  { date: "Apr 20, 2026", actor: "United States", vessel: "M/T Tifani", flag: "Stateless", desc: "Oil tanker linked to Iranian smuggling network; loaded oil at Kharg Island", status: "Currently held" },
  { date: "Apr 18, 2026", actor: "United States", vessel: "MV Touska", flag: "Iran", desc: "Iranian cargo ship disabled by USS Spruance gunfire after 6-hour warning; seized by 31st MEU", status: "Currently held" },
  { date: "Apr 12, 2024", actor: "Iran (IRGC)", vessel: "MSC Aries", flag: "Portugal", desc: "Container ship seized via helicopter boarding; Iran claimed links to Israel", status: "Currently held" },
  { date: "Jan 10, 2024", actor: "Iran (IRGC)", vessel: "St. Nikolas", flag: "Marshall Islands", desc: "Formerly named Suez Rajan; seized in Gulf of Oman", retaliation: "US confiscation of Iranian oil cargo 2023", status: "Released Dec 2025" },
  { date: "May 2, 2023", actor: "Iran (IRGC)", vessel: "Niovi", flag: "Panama", desc: "Seized while transiting the Strait of Hormuz", retaliation: "US seizure of oil from Suez Rajan", status: "Released" },
  { date: "Apr 26, 2023", actor: "Iran (IRGC)", vessel: "Advantage Sweet", flag: "Marshall Islands", desc: "Seized in Gulf of Oman; alleged collision with Iranian vessel", retaliation: "US seizure of oil from Suez Rajan", status: "Released" },
  { date: "Dec 31, 2022", actor: "United States", vessel: "Suez Rajan (oil cargo)", flag: "Marshall Islands", desc: "US DOJ seized ~1M barrels of Iranian crude; offloaded in Houston", status: "Released" },
  { date: "Jul 18, 2019", actor: "Iran (IRGC)", vessel: "Stena Impero", flag: "United Kingdom", desc: "Alleged collision with fishing vessel; retaliation for Grace 1", retaliation: "Grace 1 seizure off Gibraltar", status: "Released Sep 2019" },
];

const VesselSeizures = () => {
  const iranCount = SEIZURES.filter((s) => s.actor.startsWith("Iran")).length;
  const usUkCount = SEIZURES.filter((s) => !s.actor.startsWith("Iran")).length;
  const held = SEIZURES.filter((s) => s.status === "Currently held").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card overflow-hidden"
    >
      <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <Anchor className="h-4 w-4 sm:h-5 sm:w-5 text-crisis-red" />
          Vessel Seizures — Tit-for-Tat Tracker
        </h3>
        <div className="flex gap-2 text-[10px] sm:text-xs font-mono">
          <span className="px-2 py-1 rounded bg-crisis-red/10 text-crisis-red border border-crisis-red/30">Iran: {iranCount}</span>
          <span className="px-2 py-1 rounded bg-crisis-blue/10 text-crisis-blue border border-crisis-blue/30">US/UK: {usUkCount}</span>
          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">{held} held</span>
        </div>
      </div>
      <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
        {SEIZURES.map((s, i) => (
          <div key={i} className="p-3 sm:p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground font-mono mb-1">
                  <span>{s.date}</span>
                  <span className={s.actor.startsWith("Iran") ? "text-crisis-red" : "text-crisis-blue"}>{s.actor}</span>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {s.vessel} <span className="text-xs text-muted-foreground font-normal">({s.flag})</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                {s.retaliation && (
                  <p className="text-[10px] text-amber-500 mt-1">↳ Retaliation for: {s.retaliation}</p>
                )}
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${s.status === "Currently held" ? "bg-crisis-red/20 text-crisis-red" : "bg-muted text-muted-foreground"}`}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 bg-card border-t border-border text-[9px] sm:text-[10px] text-muted-foreground">
        Sources: Reuters, Lloyd's List, US Navy 5th Fleet press releases
      </div>
    </motion.div>
  );
};

export default VesselSeizures;
