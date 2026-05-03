import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useOilEvents } from "@/hooks/useOilEvents";
import { Flame, Shield, DollarSign, Crosshair, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

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

interface EventsTimelineProps {
  onActiveEvent?: (warDay: number | null) => void;
}

const EventsTimeline = ({ onActiveEvent }: EventsTimelineProps) => {
  const { data: events, isLoading } = useOilEvents();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setItemRef = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  useEffect(() => {
    if (!events?.length || !onActiveEvent) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible entry
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry) {
          const warDay = Number(bestEntry.target.getAttribute("data-warday"));
          if (!isNaN(warDay)) onActiveEvent(warDay);
        }
      },
      { threshold: [0.3, 0.6, 1.0], rootMargin: "-20% 0px -60% 0px" }
    );

    for (const el of itemRefs.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [events, onActiveEvent]);

  // Reset when timeline leaves viewport
  useEffect(() => {
    if (!containerRef.current || !onActiveEvent) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) onActiveEvent(null);
      },
      { threshold: 0 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [onActiveEvent]);

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

  return <EventsTimelineInner events={events || []} setItemRef={setItemRef} containerRef={containerRef} />;
};

const EventsTimelineInner = ({
  events,
  setItemRef,
  containerRef,
}: {
  events: any[];
  setItemRef: (id: number, el: HTMLDivElement | null) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [expanded, setExpanded] = useState(false);

  const days = useMemo(() => {
    const set = new Set(events.map((e) => e.warDay));
    return Array.from(set).sort((a, b) => a - b);
  }, [events]);

  const filtered = useMemo(() => {
    if (selectedDay === "all") return events;
    return events.filter((e) => e.warDay === selectedDay);
  }, [events, selectedDay]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Key Events Timeline</h3>
          <p className="text-[10px] text-muted-foreground">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            {selectedDay !== "all" ? ` on Day ${selectedDay}` : " — filter by day below"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          className="h-7 px-2 text-[10px] font-mono uppercase tracking-wider"
        >
          {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
          {expanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      {/* Day filter chips */}
      <ScrollArea className="mb-3 w-full whitespace-nowrap">
        <div className="flex gap-1.5 pb-2">
          <button
            onClick={() => setSelectedDay("all")}
            className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              selectedDay === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/50"
            }`}
          >
            All ({events.length})
          </button>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                selectedDay === d
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              Day {d}
            </button>
          ))}
        </div>
      </ScrollArea>

      <ScrollArea className={expanded ? "h-[600px]" : "h-[280px]"}>
        <div className="relative space-y-0 pr-3">
          <div className="absolute left-4 top-0 h-full w-px bg-border" />
          {filtered.map((event, i) => {
            const Icon = categoryIcons[event.category] || Flame;
            const colorClass = categoryColors[event.category] || "border-muted-foreground bg-muted text-muted-foreground";
            return (
              <motion.div
                key={event.id}
                ref={(el) => setItemRef(event.id, el)}
                data-warday={event.warDay}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(0.03 * i, 0.4) }}
                className="relative flex gap-3 py-2 pl-10"
              >
                <div className={`absolute left-2 top-3 flex h-5 w-5 items-center justify-center rounded-full border ${colorClass}`}>
                  <Icon className="h-2.5 w-2.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-muted-foreground">Day {event.warDay}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${colorClass}`}>
                      {event.category}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      ${event.brentPriceThatDay}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-foreground">{event.eventTitle}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{event.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default EventsTimeline;
