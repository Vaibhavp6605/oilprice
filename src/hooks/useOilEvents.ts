import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TimelineEvent } from "@/lib/oilData";
import { localTimelineEvents, API_URL } from "@/lib/oilData";

export function useOilEvents() {
  const queryClient = useQueryClient();

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("oil_events_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "oil_events" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["oil-events"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery<TimelineEvent[]>({
    queryKey: ["oil-events"],
    queryFn: async () => {
      // Fetch from DB
      const { data: dbEvents } = await supabase
        .from("oil_events")
        .select("*")
        .order("war_day", { ascending: true });

      // Also fetch from external API as fallback
      let apiEvents: TimelineEvent[] = [];
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        apiEvents = json.data ?? [];
      } catch {
        // API might be down, that's fine
      }

      // Convert DB events to TimelineEvent format
      const dbFormatted: TimelineEvent[] = (dbEvents || []).map((e) => ({
        id: e.war_day * 1000 + Math.random() * 100,
        date: parseInt(e.event_date.replace(/-/g, "")),
        eventTitle: e.event_title,
        description: e.description,
        warDay: e.war_day,
        category: e.category,
        brentPriceThatDay: Number(e.brent_price_that_day) || 0,
        source: e.source || "DB",
      }));

      // Merge all sources, deduplicate by warDay + title similarity
      const merged = [...apiEvents, ...localTimelineEvents, ...dbFormatted];
      const unique = new Map<string, TimelineEvent>();
      for (const e of merged) {
        const key = `${e.warDay}-${e.eventTitle.slice(0, 30)}`;
        if (!unique.has(key)) {
          unique.set(key, e);
        }
      }

      return Array.from(unique.values()).sort((a, b) => a.warDay - b.warDay);
    },
    staleTime: 2 * 60 * 1000,
  });
}
