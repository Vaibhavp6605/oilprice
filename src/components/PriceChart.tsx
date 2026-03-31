import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { dailyData } from "@/lib/oilData";

const chartData = dailyData.map((d) => ({
  date: d.date.slice(5),
  fullDate: d.date,
  Brent: d.brent_usd_barrel,
  WTI: d.wti_usd_barrel,
  Dubai: d.dubai_usd_barrel > 160 ? 155 : d.dubai_usd_barrel,
  event: d.key_event,
  warDay: d.war_day,
  phase: d.phase,
  gas: d.us_gas_avg_gallon,
  hormuz: d.strait_hormuz_daily_ships,
}));

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="min-w-[220px] rounded-lg border border-border bg-card p-4 shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-xs font-medium text-muted-foreground">{d.fullDate}</p>
        {d.warDay >= 1 && (
          <span className="rounded-full bg-crisis-red/15 px-2 py-0.5 font-mono text-[10px] font-bold text-crisis-red">
            Day {d.warDay}
          </span>
        )}
      </div>
      <div className="mb-2 space-y-1">
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-mono text-sm font-semibold" style={{ color: p.color }}>
              ${p.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-2 text-[11px] text-muted-foreground">
        <div className="flex justify-between"><span>US Gas</span><span className="font-mono text-foreground">${d.gas}/gal</span></div>
        <div className="flex justify-between"><span>Hormuz</span><span className="font-mono text-foreground">{d.hormuz} ships</span></div>
      </div>
      {d.event && (
        <p className="mt-2 border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
          📌 {d.event}
        </p>
      )}
    </div>
  );
};

const PriceChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    className="rounded-lg border border-border bg-card p-6"
  >
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Oil Price Trajectory</h3>
        <p className="text-xs text-muted-foreground">USD per barrel — Feb 9 to Mar 20, 2026</p>
      </div>
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Brent</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-crisis-blue" /> WTI</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-crisis-amber" /> Dubai</span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={340}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="brentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(14,100%,57%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(14,100%,57%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="wtiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="dubaiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(38,92%,50%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(38,92%,50%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,6%,16%)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} domain={[50, 160]} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x="02-28" stroke="hsl(0,85%,60%)" strokeDasharray="4 4" label={{ value: "WAR", fill: "hsl(0,85%,60%)", fontSize: 10, position: "top" }} />
        <Area type="monotone" dataKey="Dubai" stroke="hsl(38,92%,50%)" fill="url(#dubaiGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="Brent" stroke="hsl(14,100%,57%)" fill="url(#brentGrad)" strokeWidth={2.5} />
        <Area type="monotone" dataKey="WTI" stroke="hsl(217,91%,60%)" fill="url(#wtiGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

export default PriceChart;
