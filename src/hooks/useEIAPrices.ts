import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EIADataPoint {
  period: string;
  value: number;
  "series-description"?: string;
}

export interface EIAPrices {
  brent: EIADataPoint[];
  wti: EIADataPoint[];
  gas: EIADataPoint[];
  dubai: EIADataPoint[];
  diesel: EIADataPoint[];
  fetchedAt: string;
}

export interface LatestPrices {
  brent_usd_barrel: number | null;
  wti_usd_barrel: number | null;
  dubai_usd_barrel: number | null;
  us_gas_avg_gallon: number | null;
  us_diesel_avg_gallon: number | null;
  brent_date: string | null;
  gas_date: string | null;
  fetchedAt: string;
}

function getLatest(arr: EIADataPoint[]): { value: number | null; date: string | null } {
  if (!arr || arr.length === 0) return { value: null, date: null };
  return { value: arr[0].value, date: arr[0].period };
}

export function useEIAPrices() {
  return useQuery<LatestPrices>({
    queryKey: ["eia-prices"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("eia-prices");
      if (error) throw error;

      const raw = data as EIAPrices;
      const brent = getLatest(raw.brent);
      const wti = getLatest(raw.wti);
      const gas = getLatest(raw.gas);
      const dubai = getLatest(raw.dubai);
      const diesel = getLatest(raw.diesel);

      return {
        brent_usd_barrel: brent.value,
        wti_usd_barrel: wti.value,
        dubai_usd_barrel: dubai.value,
        us_gas_avg_gallon: gas.value,
        us_diesel_avg_gallon: diesel.value,
        brent_date: brent.date,
        gas_date: gas.date,
        fetchedAt: raw.fetchedAt,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 min
    refetchInterval: 15 * 60 * 1000, // 15 min
  });
}
