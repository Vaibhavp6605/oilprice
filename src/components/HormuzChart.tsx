import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { dailyData } from "@/lib/oilData";

const hormuzData = dailyData.map((d) => ({
  date: d.date.slice(5),
  ships: d.strait_hormuz_daily_ships,
  isCollapse: d.strait_hormuz_daily_ships < 20,
  label: d.war_day >= 1 ? `Day ${d.war_day}` : d.date.slice(5),
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-card p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-foreground">{d.ships} ships</p>
      <p className={`mt-0.5 text-xs ${d.isCollapse ? "text-crisis-red" : "text-crisis-blue"}`}>
        {d.isCollapse ? "⚠ Strait blocked" : "Normal traffic"}
      </p>
    </div>
  );
};

const HormuzChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.4 }}
    className="rounded-lg border border-border bg-card p-6"
  >
    <div className="mb-1 flex items-center gap-3">
      <h3 className="text-lg font-semibold text-foreground">Strait of Hormuz Traffic</h3>
      <span className="rounded-full border border-crisis-red/30 bg-crisis-red/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-crisis-red">
        Critical
      </span>
    </div>
    <p className="mb-1 text-xs text-muted-foreground">Daily ship passages — 20% of world oil transits through Hormuz</p>
    <div className="mb-4 flex gap-4 text-[11px]">
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-crisis-blue" /> Normal</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-crisis-red" /> Blocked</span>
    </div>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={hormuzData} margin={{ top: 20, right: 5, left: -5, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: "hsl(215,12%,50%)" }}
          tickLine={false}
          axisLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(215,12%,50%)" }}
          tickLine={false}
          axisLine={false}
          label={{ value: "Ships/day", angle: -90, position: "insideLeft", fill: "hsl(215,12%,50%)", fontSize: 10, dx: -5 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(240,6%,12%)" }} />
        <ReferenceLine y={138} stroke="hsl(215,12%,50%)" strokeDasharray="4 4" label={{ value: "Normal (138)", fill: "hsl(215,12%,50%)", fontSize: 9, position: "right" }} />
        <Bar dataKey="ships" radius={[4, 4, 0, 0]} maxBarSize={28}>
          <LabelList
            dataKey="ships"
            position="top"
            style={{ fontSize: 9, fill: "hsl(210,20%,80%)", fontFamily: "JetBrains Mono, monospace" }}
          />
          {hormuzData.map((d, i) => (
            <Cell key={i} fill={d.isCollapse ? "hsl(0,85%,60%)" : "hsl(217,91%,60%)"} fillOpacity={d.isCollapse ? 0.9 : 0.7} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);

export default HormuzChart;
