import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { dailyData } from "@/lib/oilData";

const chartData = dailyData.map((d) => ({
  date: d.date.slice(5),
  Brent: d.brent_usd_barrel,
  WTI: d.wti_usd_barrel,
  Dubai: d.dubai_usd_barrel > 160 ? 155 : d.dubai_usd_barrel,
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card p-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono text-sm" style={{ color: p.color }}>
          {p.name}: ${p.value.toFixed(2)}
        </p>
      ))}
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
