import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Radio } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import PriceChart from "@/components/PriceChart";
import EventsTimeline from "@/components/EventsTimeline";
import PredictionPanel from "@/components/PredictionPanel";
import HormuzChart from "@/components/HormuzChart";
import { dailyData } from "@/lib/oilData";

const prewar = dailyData[5]; // Feb 27

const Index = () => {
  const [activeWarDay, setActiveWarDay] = useState<number | null>(null);

  const latest = useMemo(() => {
    if (activeWarDay === null) return dailyData[dailyData.length - 1];
    // Find closest dailyData entry by war_day
    let closest = dailyData[0];
    let minDiff = Math.abs(dailyData[0].war_day - activeWarDay);
    for (const d of dailyData) {
      const diff = Math.abs(d.war_day - activeWarDay);
      if (diff < minDiff) {
        minDiff = diff;
        closest = d;
      }
    }
    return closest;
  }, [activeWarDay]);

  const handleActiveEvent = useCallback((warDay: number | null) => {
    setActiveWarDay(warDay);
  }, []);

  const defaultLatest = dailyData[dailyData.length - 1];

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Iran War Oil Crisis 2026
              </h1>
              <p className="text-[10px] text-muted-foreground">Real-time conflict impact dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="h-3 w-3 animate-pulse-glow text-crisis-red" />
            <span className="font-mono text-xs text-crisis-red">LIVE — Day {defaultLatest.war_day}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard
            title="Brent Crude"
            value={`$${latest.brent_usd_barrel}`}
            change={`+${latest.brent_vs_prewar_pct}% from pre-war`}
            changeType="up"
            subtitle={`Pre-war: $${prewar.brent_usd_barrel}`}
            glowClass="card-glow"
            delay={0}
            animateValue
          />
          <KpiCard
            title="US Gas Price"
            value={`$${latest.us_gas_avg_gallon}/gal`}
            change={`+${latest.gas_vs_prewar_pct}%`}
            changeType="up"
            subtitle={`Pre-war: $${prewar.us_gas_avg_gallon}`}
            delay={0.1}
            animateValue
          />
          <KpiCard
            title="Hormuz Traffic"
            value={`${latest.strait_hormuz_daily_ships}`}
            change={`-${((1 - latest.strait_hormuz_daily_ships / prewar.strait_hormuz_daily_ships) * 100).toFixed(1)}% collapse`}
            changeType="down"
            subtitle={`Normal: ${prewar.strait_hormuz_daily_ships} ships/day`}
            glowClass="card-glow-red"
            delay={0.2}
            animateValue
          />
          <KpiCard
            title="Iran Production"
            value={`${latest.iran_production_mbpd} mbpd`}
            change={`-${((1 - latest.iran_production_mbpd / prewar.iran_production_mbpd) * 100).toFixed(0)}%`}
            changeType="down"
            subtitle={`Pre-war: ${prewar.iran_production_mbpd} mbpd`}
            delay={0.3}
            animateValue
          />
        </div>

        {/* Extra KPI Row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard
            title="Brent-WTI Spread"
            value={`$${(latest.brent_usd_barrel - latest.wti_usd_barrel).toFixed(1)}`}
            change={`Pre-war: $${(prewar.brent_usd_barrel - prewar.wti_usd_barrel).toFixed(1)}`}
            changeType="up"
            subtitle="Global vs US benchmark gap"
            delay={0.4}
            animateValue
          />
          <KpiCard
            title="Days at War"
            value={`${latest.war_day}`}
            change="Ongoing conflict"
            changeType="neutral"
            subtitle={`Since Feb 28, 2026`}
            glowClass="card-glow-red"
            delay={0.5}
            animateValue
          />
          <KpiCard
            title="Supply Loss"
            value={`${(prewar.iran_production_mbpd - latest.iran_production_mbpd).toFixed(1)} mbpd`}
            change={`-${((1 - latest.iran_production_mbpd / prewar.iran_production_mbpd) * 100).toFixed(0)}% Iranian output`}
            changeType="down"
            subtitle="Barrels/day taken offline"
            delay={0.6}
            animateValue
          />
          <KpiCard
            title="Consumer Cost Impact"
            value={`+$${((latest.us_gas_avg_gallon - prewar.us_gas_avg_gallon) * 50).toFixed(0)}/mo`}
            change={`+$${(latest.us_gas_avg_gallon - prewar.us_gas_avg_gallon).toFixed(2)}/gal surge`}
            changeType="up"
            subtitle="Est. extra cost per household"
            delay={0.7}
            animateValue
          />
        </div>

        {/* Charts Row */}
        <PriceChart />

        <div className="grid gap-6 lg:grid-cols-2">
          <HormuzChart />
          <PredictionPanel />
        </div>

        {/* Timeline */}
        <EventsTimeline onActiveEvent={handleActiveEvent} />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="border-t border-border py-4 text-center text-xs text-muted-foreground"
        >
          Data sources: AAA, CNBC, Fortune, NPR, CBS, Reuters, Euronews, IEA — verified as of March 20, 2026
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
