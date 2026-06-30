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

const HOUR_MS = 60 * 60 * 1000;

export const useAisShips = (_mode: RefreshMode = "cached") => {
  return useQuery({
    queryKey: ["hormuz-ais-ships", "hourly"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("hormuz-ships");
      if (error) throw error;
      return (data?.ships || []) as AisShip[];
    },
    refetchInterval: HOUR_MS,
    staleTime: HOUR_MS - 60_000,
    refetchOnWindowFocus: false,
  });
};
