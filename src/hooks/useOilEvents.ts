import { useQuery } from "@tanstack/react-query";
import { API_URL, localTimelineEvents, type TimelineEvent } from "@/lib/oilData";

export function useOilEvents() {
  return useQuery<TimelineEvent[]>({
    queryKey: ["oil-events"],
    queryFn: async () => {
      const res = await fetch(API_URL);
      const json = await res.json();
      const apiEvents: TimelineEvent[] = json.data ?? [];
      const merged = [...apiEvents, ...localTimelineEvents];
      const unique = Array.from(new Map(merged.map(e => [e.id, e])).values());
      return unique.sort((a, b) => a.warDay - b.warDay);
    },
    staleTime: 5 * 60 * 1000,
  });
}
