import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { motion } from "framer-motion";
import { useDailySnapshots } from "@/hooks/useDailySnapshots";

const HormuzChart = () => {
  const { data: snapshots } = useDailySnapshots();

  const hormuzData = (snapshots || []).map((d) => ({
    date: d.date.slice(5),
    ships: d.strait_hormuz_daily_ships,
    isCollapse: d.strait_hormuz_daily_ships < 20,
    warDay: d.war_day,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="rounded-lg border border-border bg-card p-6 flex flex-col h-full"
    >
      <h3 className="text-lg font-semibold text-foreground">Strait of Hormuz Traffic</h3>
      <p className="mb-4 text-xs text-muted-foreground">Ships per day — auto-updated via AI estimates (Source: Kpler, BBC Verify, HormuzTracker)</p>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hormuzData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215,12%,50%)" }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "hsl(240,6%,12%)" }}
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-xl">
                    <p className="text-xs text-muted-foreground">{d.date}</p>
                    <p className="mt-1 font-mono text-xl font-bold text-foreground">{d.ships} <span className="text-xs font-normal text-muted-foreground">ships/day</span></p>
                    <p className={`mt-1 text-[11px] font-medium ${d.isCollapse ? "text-crisis-red" : "text-crisis-blue"}`}>
                      {d.isCollapse ? "⚠ Strait blocked" : "Normal traffic"}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="ships" radius={[4, 4, 0, 0]}>
              {hormuzData.map((d, i) => (
                <Cell key={i} fill={d.isCollapse ? "hsl(0,85%,60%)" : "hsl(217,91%,60%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default HormuzChart;
