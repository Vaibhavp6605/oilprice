import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { DailyData } from "@/lib/oilData";
import { dailyData as hardcodedData } from "@/lib/oilData";

export function useDailySnapshots() {
  const queryClient = useQueryClient();

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("daily_snapshots_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_snapshots" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["daily-snapshots"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery<DailyData[]>({
    queryKey: ["daily-snapshots"],
    queryFn: async () => {
      const { data: dbSnapshots, error } = await supabase
        .from("daily_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: true });

      if (error || !dbSnapshots?.length) {
        return hardcodedData;
      }

      // Pre-war reference for percentage calculations
      const prewarBrent = 73.1;
      const prewarGas = 2.98;

      const converted: DailyData[] = dbSnapshots.map((s) => ({
        date: s.snapshot_date,
        brent_usd_barrel: Number(s.brent_usd) || 0,
        wti_usd_barrel: Number(s.wti_usd) || 0,
        dubai_usd_barrel: Number(s.dubai_usd) || 0,
        us_gas_avg_gallon: Number(s.gas_avg) || 0,
        us_diesel_avg_gallon: Number(s.diesel_avg) || 0,
        strait_hormuz_daily_ships: s.hormuz_ships || 0,
        iran_production_mbpd: Number(s.iran_production) || 0,
        key_event: s.key_event || "",
        war_day: s.war_day,
        brent_vs_prewar_pct: ((Number(s.brent_usd) - prewarBrent) / prewarBrent) * 100,
        gas_vs_prewar_pct: ((Number(s.gas_avg) - prewarGas) / prewarGas) * 100,
        gas_change_from_prewar_dollars: Number(s.gas_avg) - prewarGas,
        phase: s.phase || "Ongoing",
      }));

      return converted;
    },
    staleTime: 2 * 60 * 1000,
  });
}
