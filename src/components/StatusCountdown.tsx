import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

const START = new Date("2026-02-27T00:00:00Z").getTime();

const StatusCountdown = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = now - START;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-crisis-red/30 bg-crisis-red/5 p-4 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-crisis-red animate-pulse" />
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-crisis-red font-bold">
          Strait Status: RESTRICTED
        </span>
      </div>
      <div className="flex items-end gap-3 sm:gap-6 font-mono">
        <div>
          <div className="text-3xl sm:text-5xl font-bold text-foreground">{days}</div>
          <div className="text-[9px] sm:text-xs text-muted-foreground uppercase">Days</div>
        </div>
        <div className="text-2xl sm:text-4xl text-muted-foreground pb-1">:</div>
        <div>
          <div className="text-3xl sm:text-5xl font-bold text-foreground">{String(hours).padStart(2, "0")}</div>
          <div className="text-[9px] sm:text-xs text-muted-foreground uppercase">Hours</div>
        </div>
        <div className="text-2xl sm:text-4xl text-muted-foreground pb-1">:</div>
        <div>
          <div className="text-3xl sm:text-5xl font-bold text-foreground">{String(mins).padStart(2, "0")}</div>
          <div className="text-[9px] sm:text-xs text-muted-foreground uppercase">Minutes</div>
        </div>
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-3">Since February 27, 2026</p>
    </motion.div>
  );
};

export default StatusCountdown;
