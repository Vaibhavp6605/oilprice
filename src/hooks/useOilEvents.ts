import { useQuery } from "@tanstack/react-query";
import { API_URL, type TimelineEvent } from "@/lib/oilData";

export function useOilEvents() {
  return useQuery<TimelineEvent[]>({
    queryKey: ["oil-events"],
    queryFn: async () => {
      const res = await fetch(API_URL);
      const json = await res.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
