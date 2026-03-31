import { motion } from "framer-motion";
import { useOilEvents } from "@/hooks/useOilEvents";
import { Flame, Shield, DollarSign, Crosshair, Zap } from "lucide-react";

const categoryIcons: Record<string, any> = {
  "Conflict Start": Flame,
  "Energy Infrastructure": Zap,
  "Policy Response": Shield,
  "Price Record": DollarSign,
  "Price Milestone": DollarSign,
  "Military Escalation": Crosshair,
};

const categoryColors: Record<string, string> = {
  "Conflict Start": "border-crisis-red bg-crisis-red/10 text-crisis-red",
  "Energy Infrastructure": "border-crisis-amber bg-crisis-amber/10 text-crisis-amber",
  "Policy Response": "border-crisis-blue bg-crisis-blue/10 text-crisis-blue",
  "Price Record": "border-primary bg-primary/10 text-primary",
  "Price Milestone": "border-primary bg-primary/10 text-primary",
  "Military Escalation": "border-crisis-red bg-crisis-red/10 text-crisis-red",
};

const EventsTimeline = () => {
  const { data: events, isLoading } = useOilEvents();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="rounded-lg border border-border bg-card p-6"
    >
      <h3 className="text-lg font-semibold text-foreground">Key Events Timeline</h3>
      <p className="mb-4 text-xs text-muted-foreground">Live from API — major war milestones</p>

      <div className="relative space-y-0">
        <div className="absolute left-4 top-0 h-full w-px bg-border" />
        {events?.map((event, i) => {
          const Icon = categoryIcons[event.category] || Flame;
          const colorClass = categoryColors[event.category] || "border-muted-foreground bg-muted text-muted-foreground";
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="relative flex gap-4 py-3 pl-10"
            >
              <div className={`absolute left-2 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${colorClass}`}>
                <Icon className="h-2.5 w-2.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">Day {event.warDay}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${colorClass}`}>
                    {event.category}
                  </span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    ${event.brentPriceThatDay}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{event.eventTitle}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{event.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EventsTimeline;
