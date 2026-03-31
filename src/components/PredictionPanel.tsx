import { motion } from "framer-motion";
import { predictions } from "@/lib/oilData";
import { Target } from "lucide-react";

const colorMap = {
  "crisis-green": "border-crisis-green/30 bg-crisis-green/5",
  "crisis-red": "border-crisis-red/30 bg-crisis-red/5",
  "crisis-amber": "border-crisis-amber/30 bg-crisis-amber/5",
} as const;

const textColorMap = {
  "crisis-green": "text-crisis-green",
  "crisis-red": "text-crisis-red",
  "crisis-amber": "text-crisis-amber",
} as const;

const PredictionPanel = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.6 }}
    className="rounded-lg border border-border bg-card p-6"
  >
    <div className="mb-4 flex items-center gap-2">
      <Target className="h-4 w-4 text-primary" />
      <h3 className="text-lg font-semibold text-foreground">Price Predictions</h3>
    </div>
    <p className="mb-5 text-xs text-muted-foreground">Scenario analysis based on historical oil shock patterns</p>

    <div className="space-y-3">
      {predictions.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * i + 0.6 }}
          className={`rounded-md border p-4 ${colorMap[p.color]}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{p.scenario}</p>
            <span className={`font-mono text-sm font-bold ${textColorMap[p.color]}`}>{p.probability}</span>
          </div>
          <div className="mt-2 flex gap-6 text-xs text-muted-foreground">
            <span>Brent: <span className="font-mono text-foreground">{p.brentTarget}</span></span>
            <span>US Gas: <span className="font-mono text-foreground">{p.gasTarget}</span></span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default PredictionPanel;
