import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Droplets, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDailySnapshots } from "@/hooks/useDailySnapshots";
import { useEIAPrices } from "@/hooks/useEIAPrices";

function useChartData() {
  const { data: snapshots } = useDailySnapshots();
  const { data: live, isError: liveError } = useEIAPrices();
  const allData = snapshots || [];

  if (!allData.length) return { chartData: [], isLive: false };

  const isLive = !!live && !liveError;

  // Map DB snapshots to chart format, override last point with live EIA data
  const chartData = allData.map((d, i) => {
    const isLast = i === allData.length - 1;
    return {
      date: d.date.slice(5),
      fullDate: d.date,
      Brent: isLast && live?.brent_usd_barrel ? live.brent_usd_barrel : d.brent_usd_barrel,
      WTI: isLast && live?.wti_usd_barrel ? live.wti_usd_barrel : d.wti_usd_barrel,
      Dubai: isLast && live?.dubai_usd_barrel ? live.dubai_usd_barrel : d.dubai_usd_barrel,
      Gas: isLast && live?.us_gas_avg_gallon ? live.us_gas_avg_gallon : d.us_gas_avg_gallon,
      Diesel: isLast && live?.us_diesel_avg_gallon ? live.us_diesel_avg_gallon : d.us_diesel_avg_gallon,
      event: d.key_event,
      warDay: d.war_day,
      hormuz: d.strait_hormuz_daily_ships,
    };
  });

  return { chartData, isLive };
}

const CombinedCrudeChart = () => {
  const { chartData, isLive } = useChartData();
  if (!chartData.length) return null;

  const latest = chartData[chartData.length - 1];
  const prewarIdx = chartData.findIndex(d => d.warDay === -1) ?? 0;
  const prewarData = chartData[prewarIdx] || chartData[0];

  const benchmarks = [
    { key: "Brent", color: "hsl(14,100%,57%)", grad: "brentG", label: "Brent" },
    { key: "WTI", color: "hsl(217,91%,60%)", grad: "wtiG", label: "WTI" },
    { key: "Dubai", color: "hsl(38,92%,50%)", grad: "dubaiG", label: "Dubai" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-lg border border-border bg-card p-5"
    >
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Crude Oil Benchmarks</h3>
              <p className="text-[10px] text-muted-foreground">
                Brent · WTI · Dubai ($/barrel)
                {isLive && <span className="ml-1 text-crisis-green">● LIVE</span>}
              </p>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            {benchmarks.map((b) => (
              <p key={b.key} className="font-mono text-xs" style={{ color: b.color }}>
                {b.label} ${latest[b.key as keyof typeof latest]}
              </p>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {benchmarks.map((b) => {
            const prewarVal = prewarData[b.key as keyof typeof prewarData] as number;
            const latestVal = latest[b.key as keyof typeof latest] as number;
            const pct = ((latestVal - prewarVal) / prewarVal * 100).toFixed(1);
            return (
              <Badge key={b.key} variant="outline" className="gap-1 font-mono text-[10px] border-crisis-red/30 text-crisis-red">
                <TrendingUp className="h-3 w-3" />{b.label} +{pct}%
              </Badge>
            );
          })}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <defs>
            {benchmarks.map((b) => (
              <linearGradient key={b.grad} id={b.grad} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={b.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={b.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,6%,16%)" />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} interval={2} />
          <YAxis tick={{ fontSize: 9, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
          <Tooltip
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="min-w-[180px] rounded-lg border border-border bg-card p-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-muted-foreground">{d.fullDate}</p>
                    {d.warDay >= 1 && (
                      <span className="rounded-full bg-crisis-red/15 px-2 py-0.5 font-mono text-[10px] font-bold text-crisis-red">
                        Day {d.warDay}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {benchmarks.map((b) => (
                      <p key={b.key} className="font-mono text-sm font-bold" style={{ color: b.color }}>
                        {b.label}: ${Number(d[b.key] ?? 0).toFixed(2)}
                      </p>
                    ))}
                  </div>
                  {d.event && (
                    <p className="mt-2 border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
                      📌 {d.event}
                    </p>
                  )}
                </div>
              );
            }}
          />
          <ReferenceLine x="02-28" stroke="hsl(0,85%,60%)" strokeDasharray="4 4" label={{ value: "WAR", fill: "hsl(0,85%,60%)", fontSize: 9, position: "top" }} />
          {benchmarks.map((b) => (
            <Area key={b.key} type="monotone" dataKey={b.key} stroke={b.color} fill={`url(#${b.grad})`} strokeWidth={2} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

const FuelChart = () => {
  const { chartData, isLive } = useChartData();
  if (!chartData.length) return null;

  const latest = chartData[chartData.length - 1];
  const prewarIdx = chartData.findIndex(d => d.warDay === -1) ?? 0;
  const prewarData = chartData[prewarIdx] || chartData[0];
  const prewarGas = prewarData.Gas as number;
  const prewarDiesel = prewarData.Diesel as number;
  const gasPct = (((latest.Gas as number) - prewarGas) / prewarGas * 100).toFixed(1);
  const dieselPct = (((latest.Diesel as number) - prewarDiesel) / prewarDiesel * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-lg border border-border bg-card p-5 flex flex-col"
    >
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">US Gas & Diesel</h3>
              <p className="text-[10px] text-muted-foreground">
                Consumer fuel prices ($/gallon)
                {isLive && <span className="ml-1 text-crisis-green">● LIVE</span>}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs" style={{ color: "hsl(142,70%,45%)" }}>Gas ${latest.Gas}</p>
            <p className="font-mono text-xs" style={{ color: "hsl(280,70%,60%)" }}>Diesel ${latest.Diesel}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1 font-mono text-[10px] border-crisis-red/30 text-crisis-red">
            <TrendingUp className="h-3 w-3" />Gas +{gasPct}%
          </Badge>
          <Badge variant="outline" className="gap-1 font-mono text-[10px] border-crisis-red/30 text-crisis-red">
            <TrendingUp className="h-3 w-3" />Diesel +{dieselPct}%
          </Badge>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gasG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142,70%,45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142,70%,45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dieselG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(280,70%,60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(280,70%,60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,6%,16%)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
            <Tooltip
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="min-w-[160px] rounded-lg border border-border bg-card p-3 shadow-xl">
                    <p className="font-mono text-xs text-muted-foreground">{d.fullDate}</p>
                    {d.warDay >= 1 && (
                      <span className="rounded-full bg-crisis-red/15 px-2 py-0.5 font-mono text-[10px] font-bold text-crisis-red">Day {d.warDay}</span>
                    )}
                    <div className="mt-1 space-y-1">
                      <p className="font-mono text-sm" style={{ color: "hsl(142,70%,45%)" }}>Gas: ${d.Gas}/gal</p>
                      <p className="font-mono text-sm" style={{ color: "hsl(280,70%,60%)" }}>Diesel: ${d.Diesel}/gal</p>
                    </div>
                  </div>
                );
              }}
            />
            <ReferenceLine x="02-28" stroke="hsl(0,85%,60%)" strokeDasharray="4 4" label={{ value: "WAR", fill: "hsl(0,85%,60%)", fontSize: 9, position: "top" }} />
            <Area type="monotone" dataKey="Gas" stroke="hsl(142,70%,45%)" fill="url(#gasG)" strokeWidth={2} />
            <Area type="monotone" dataKey="Diesel" stroke="hsl(280,70%,60%)" fill="url(#dieselG)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

const PriceChart = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <CombinedCrudeChart />
    <FuelChart />
  </div>
);

export default PriceChart;
