import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  subtitle?: string;
  glowClass?: string;
  delay?: number;
}

const KpiCard = ({ title, value, change, changeType = "neutral", subtitle, glowClass = "", delay = 0 }: KpiCardProps) => {
  const Icon = changeType === "up" ? TrendingUp : changeType === "down" ? TrendingDown : Minus;
  const changeColor = changeType === "up" ? "text-crisis-red" : changeType === "down" ? "text-crisis-green" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-lg border border-border bg-card p-5 ${glowClass}`}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="mt-2 font-mono text-3xl font-bold text-foreground">{value}</p>
      {change && (
        <div className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${changeColor}`}>
          <Icon className="h-3.5 w-3.5" />
          <span>{change}</span>
        </div>
      )}
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
};

export default KpiCard;
