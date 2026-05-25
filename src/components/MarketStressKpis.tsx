import KpiCard from "@/components/KpiCard";

const MarketStressKpis = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
    <KpiCard
      title="War Risk Insurance"
      value="3.0%"
      change="20× normal (0.15%)"
      changeType="up"
      subtitle="Lloyd's JWC — H&M value"
      glowClass="card-glow-red"
      delay={0}
      animateValue
    />
    <KpiCard
      title="VLCC Spot — TD3C"
      value="250 WS"
      change="+400% vs pre-crisis"
      changeType="up"
      subtitle="Baltic Exchange · AG-East"
      delay={0.1}
      animateValue
    />
    <KpiCard
      title="World Oil at Risk"
      value="21%"
      change="$12.5B daily cost (est.)"
      changeType="down"
      subtitle="EIA: ~21 mbpd transit Hormuz"
      glowClass="card-glow-red"
      delay={0.2}
      animateValue
    />
    <KpiCard
      title="World LNG at Risk"
      value="25%"
      change="$3.2B daily cost (est.)"
      changeType="down"
      subtitle="Qatar exports via Hormuz"
      delay={0.3}
      animateValue
    />
  </div>
);

export default MarketStressKpis;
