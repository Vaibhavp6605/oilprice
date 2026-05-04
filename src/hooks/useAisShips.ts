import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AisShip {
  mmsi: number;
  name: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  type: number;
  ts: number;
}

export type RefreshMode = "live" | "cached";

export const useAisShips = (mode: RefreshMode = "cached") => {
  return useQuery({
    queryKey: ["hormuz-ais-ships", mode],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("hormuz-ships");
      if (error) throw error;
      return (data?.ships || []) as AisShip[];
    },
    refetchInterval: mode === "live" ? 20_000 : 5 * 60_000,
    staleTime: mode === "live" ? 10_000 : 4 * 60_000,
  });
};
