import { motion } from "framer-motion";
import { useOilEvents } from "@/hooks/useOilEvents";
import { Flame, Shield, DollarSign, Crosshair, Zap, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categoryIcons: Record<string, any> = {
  "Conflict Start": Flame,
  "Energy Infrastructure": Zap,
  "Policy Response": Shield,
  "Price Record": DollarSign,
  "Price Milestone": DollarSign,
  "Military Escalation": Crosshair,
};

const categoryBg: Record<string, string> = {
  "Conflict Start": "bg-crisis-red/10 text-crisis-red border-crisis-red/30",
  "Energy Infrastructure": "bg-crisis-amber/10 text-crisis-amber border-crisis-amber/30",
  "Policy Response": "bg-crisis-blue/10 text-crisis-blue border-crisis-blue/30",
  "Price Record": "bg-primary/10 text-primary border-primary/30",
  "Price Milestone": "bg-primary/10 text-primary border-primary/30",
  "Military Escalation": "bg-crisis-red/10 text-crisis-red border-crisis-red/30",
};

const RecentEvents = () => {
  const { data: events, isLoading } = useOilEvents();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  // Get the most recent day's events
  const maxDay = events?.length ? Math.max(...events.map((e) => e.warDay)) : 0;
  const recentEvents = events?.filter((e) => e.warDay >= maxDay - 1).slice(-6) || [];

  if (!recentEvents.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Latest Developments</h3>
          <Badge variant="outline" className="font-mono text-[10px]">
            Day {maxDay}
          </Badge>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recentEvents.map((event, i) => {
          const Icon = categoryIcons[event.category] || Flame;
          const colorClass = categoryBg[event.category] || "bg-muted text-muted-foreground border-border";
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="group relative rounded-lg border border-border bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md border ${colorClass}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${colorClass}`}>
                  {event.category}
                </span>
              </div>
              <p className="text-xs font-medium leading-snug text-foreground line-clamp-2">
                {event.eventTitle.replace(/^DAY \d+:\s*/i, "")}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                {event.description}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">
                  ${event.brentPriceThatDay}
                </span>
                {event.source && event.source !== "AI-generated" && (
                  <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <ExternalLink className="h-2.5 w-2.5" />
                    {event.source}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecentEvents;
