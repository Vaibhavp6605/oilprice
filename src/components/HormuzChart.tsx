import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { motion } from "framer-motion";
import { dailyData } from "@/lib/oilData";

const hormuzData = dailyData
  .filter((_, i) => i % 2 === 0 || dailyData[i].strait_hormuz_daily_ships < 20)
  .map((d) => ({
    date: d.date.slice(5),
    ships: d.strait_hormuz_daily_ships,
    isCollapse: d.strait_hormuz_daily_ships < 20,
  }));

const HormuzChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.4 }}
    className="rounded-lg border border-border bg-card p-6"
  >
    <h3 className="text-lg font-semibold text-foreground">Strait of Hormuz Traffic</h3>
    <p className="mb-4 text-xs text-muted-foreground">Ships per day — 96.4% collapse post-strike</p>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={hormuzData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "hsl(240,8%,8%)", border: "1px solid hsl(240,6%,16%)", borderRadius: "6px", fontSize: "12px" }}
          labelStyle={{ color: "hsl(215,12%,50%)" }}
        />
        <Bar dataKey="ships" radius={[4, 4, 0, 0]}>
          {hormuzData.map((d, i) => (
            <Cell key={i} fill={d.isCollapse ? "hsl(0,85%,60%)" : "hsl(217,91%,60%)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);

export default HormuzChart;
