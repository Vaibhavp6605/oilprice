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

export const useAisShips = () => {
  return useQuery({
    queryKey: ["hormuz-ais-ships"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("hormuz-ships");
      if (error) throw error;
      return (data?.ships || []) as AisShip[];
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};
