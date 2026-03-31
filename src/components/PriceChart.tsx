import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { dailyData } from "@/lib/oilData";

const chartData = dailyData.map((d) => ({
  date: d.date.slice(5),
  fullDate: d.date,
  Brent: d.brent_usd_barrel,
  WTI: d.wti_usd_barrel,
  Dubai: d.dubai_usd_barrel,
  event: d.key_event,
  warDay: d.war_day,
  gas: d.us_gas_avg_gallon,
  hormuz: d.strait_hormuz_daily_ships,
}));

interface SingleChartProps {
  title: string;
  subtitle: string;
  dataKey: string;
  color: string;
  gradientId: string;
  delay: number;
  domain: [number, number];
}

const SingleTooltip = ({ active, payload, dataKey, color }: any) => {
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
      <p className="mt-1 font-mono text-2xl font-bold" style={{ color }}>
        ${d[dataKey].toFixed(2)}
      </p>
      {d.event && (
        <p className="mt-2 border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
          📌 {d.event}
        </p>
      )}
    </div>
  );
};

const SingleChart = ({ title, subtitle, dataKey, color, gradientId, delay, domain }: SingleChartProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="rounded-lg border border-border bg-card p-5"
  >
    <div className="mb-3 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
      </div>
      <span className="font-mono text-lg font-bold" style={{ color }}>
        ${chartData[chartData.length - 1][dataKey as keyof typeof chartData[0]]}
      </span>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,6%,16%)" />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} interval={2} />
        <YAxis tick={{ fontSize: 9, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} domain={domain} />
        <Tooltip content={<SingleTooltip dataKey={dataKey} color={color} />} />
        <ReferenceLine x="02-28" stroke="hsl(0,85%,60%)" strokeDasharray="4 4" label={{ value: "WAR", fill: "hsl(0,85%,60%)", fontSize: 9, position: "top" }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

const PriceChart = () => (
  <div className="grid gap-4 md:grid-cols-3">
    <SingleChart
      title="Brent Crude"
      subtitle="Global benchmark (North Sea)"
      dataKey="Brent"
      color="hsl(14,100%,57%)"
      gradientId="brentG"
      delay={0.2}
      domain={[60, 120]}
    />
    <SingleChart
      title="WTI Crude"
      subtitle="US benchmark (West Texas)"
      dataKey="WTI"
      color="hsl(217,91%,60%)"
      gradientId="wtiG"
      delay={0.3}
      domain={[55, 110]}
    />
    <SingleChart
      title="Dubai Crude"
      subtitle="Middle East benchmark (UAE)"
      dataKey="Dubai"
      color="hsl(38,92%,50%)"
      gradientId="dubaiG"
      delay={0.4}
      domain={[60, 160]}
    />
  </div>
);

export default PriceChart;
