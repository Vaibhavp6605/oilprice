export interface DailyData {
  date: string;
  brent_usd_barrel: number;
  wti_usd_barrel: number;
  dubai_usd_barrel: number;
  us_gas_avg_gallon: number;
  us_diesel_avg_gallon: number;
  strait_hormuz_daily_ships: number;
  iran_production_mbpd: number;
  key_event: string;
  war_day: number;
  brent_vs_prewar_pct: number;
  gas_vs_prewar_pct: number;
  gas_change_from_prewar_dollars: number;
  phase: string;
}

export interface TimelineEvent {
  date: number;
  eventTitle: string;
  description: string;
  warDay: number;
  category: string;
  brentPriceThatDay: number;
  source: string;
  id: number;
}

export const API_URL = "https://api.sheetninja.io/b2cfd6abc6404027be94a888d88b36dd/oilFile/iranWarKeyEventsTimeline";

// Hardcoded daily data from the notebook (24 rows)
export const dailyData: DailyData[] = [
  { date: "2026-02-09", brent_usd_barrel: 67.4, wti_usd_barrel: 62.1, dubai_usd_barrel: 66.8, us_gas_avg_gallon: 2.81, us_diesel_avg_gallon: 3.68, strait_hormuz_daily_ships: 138, iran_production_mbpd: 3.3, key_event: "Trump-Iran diplomatic talks described as 'very good'", war_day: -19, brent_vs_prewar_pct: -7.8, gas_vs_prewar_pct: -5.7, gas_change_from_prewar_dollars: -0.17, phase: "Pre-War Tensions" },
  { date: "2026-02-10", brent_usd_barrel: 69.3, wti_usd_barrel: 64.2, dubai_usd_barrel: 68.4, us_gas_avg_gallon: 2.83, us_diesel_avg_gallon: 3.70, strait_hormuz_daily_ships: 138, iran_production_mbpd: 3.3, key_event: "US warns ships to avoid Iranian waters", war_day: -18, brent_vs_prewar_pct: -5.2, gas_vs_prewar_pct: -5.0, gas_change_from_prewar_dollars: -0.15, phase: "Pre-War Tensions" },
  { date: "2026-02-14", brent_usd_barrel: 71.2, wti_usd_barrel: 65.8, dubai_usd_barrel: 70.1, us_gas_avg_gallon: 2.84, us_diesel_avg_gallon: 3.71, strait_hormuz_daily_ships: 138, iran_production_mbpd: 3.3, key_event: "Iran insists on maintaining uranium enrichment", war_day: -14, brent_vs_prewar_pct: -2.6, gas_vs_prewar_pct: -4.7, gas_change_from_prewar_dollars: -0.14, phase: "Pre-War Tensions" },
  { date: "2026-02-18", brent_usd_barrel: 72.8, wti_usd_barrel: 67.4, dubai_usd_barrel: 71.8, us_gas_avg_gallon: 2.85, us_diesel_avg_gallon: 3.72, strait_hormuz_daily_ships: 138, iran_production_mbpd: 3.3, key_event: "US-Israel joint military exercises escalate tensions", war_day: -10, brent_vs_prewar_pct: -0.4, gas_vs_prewar_pct: -4.4, gas_change_from_prewar_dollars: -0.13, phase: "Pre-War Tensions" },
  { date: "2026-02-24", brent_usd_barrel: 71.5, wti_usd_barrel: 66.2, dubai_usd_barrel: 70.4, us_gas_avg_gallon: 2.87, us_diesel_avg_gallon: 3.74, strait_hormuz_daily_ships: 138, iran_production_mbpd: 3.2, key_event: "Final diplomatic ultimatum issued to Iran", war_day: -4, brent_vs_prewar_pct: -2.2, gas_vs_prewar_pct: -3.7, gas_change_from_prewar_dollars: -0.11, phase: "Pre-War Tensions" },
  { date: "2026-02-27", brent_usd_barrel: 73.1, wti_usd_barrel: 67.8, dubai_usd_barrel: 72.2, us_gas_avg_gallon: 2.92, us_diesel_avg_gallon: 3.75, strait_hormuz_daily_ships: 138, iran_production_mbpd: 3.2, key_event: "Pre-strike day — market pricing in risk premium", war_day: -1, brent_vs_prewar_pct: 0.0, gas_vs_prewar_pct: -2.0, gas_change_from_prewar_dollars: -0.06, phase: "Pre-War Tensions" },
  { date: "2026-02-28", brent_usd_barrel: 79.5, wti_usd_barrel: 72.7, dubai_usd_barrel: 78.4, us_gas_avg_gallon: 2.98, us_diesel_avg_gallon: 3.76, strait_hormuz_daily_ships: 12, iran_production_mbpd: 2.8, key_event: "DAY 1: US-Israel launch joint airstrikes on Iran", war_day: 1, brent_vs_prewar_pct: 8.8, gas_vs_prewar_pct: 0.0, gas_change_from_prewar_dollars: 0.0, phase: "Week 1 Shock" },
  { date: "2026-03-01", brent_usd_barrel: 84.2, wti_usd_barrel: 77.1, dubai_usd_barrel: 83.8, us_gas_avg_gallon: 3.05, us_diesel_avg_gallon: 3.82, strait_hormuz_daily_ships: 8, iran_production_mbpd: 2.6, key_event: "DAY 2: Iran fires ballistic missiles at Israel", war_day: 2, brent_vs_prewar_pct: 15.2, gas_vs_prewar_pct: 2.3, gas_change_from_prewar_dollars: 0.07, phase: "Week 1 Shock" },
  { date: "2026-03-02", brent_usd_barrel: 87.6, wti_usd_barrel: 80.4, dubai_usd_barrel: 86.9, us_gas_avg_gallon: 3.12, us_diesel_avg_gallon: 3.88, strait_hormuz_daily_ships: 5, iran_production_mbpd: 2.4, key_event: "DAY 3: Qatar suspends LNG production after drone attacks", war_day: 3, brent_vs_prewar_pct: 19.8, gas_vs_prewar_pct: 4.7, gas_change_from_prewar_dollars: 0.14, phase: "Week 1 Shock" },
  { date: "2026-03-03", brent_usd_barrel: 91.2, wti_usd_barrel: 83.8, dubai_usd_barrel: 90.6, us_gas_avg_gallon: 3.18, us_diesel_avg_gallon: 3.94, strait_hormuz_daily_ships: 5, iran_production_mbpd: 2.3, key_event: "DAY 4: US sinks 16 Iranian minelaying vessels", war_day: 4, brent_vs_prewar_pct: 24.8, gas_vs_prewar_pct: 6.7, gas_change_from_prewar_dollars: 0.20, phase: "Week 1 Shock" },
  { date: "2026-03-04", brent_usd_barrel: 91.98, wti_usd_barrel: 84.5, dubai_usd_barrel: 91.4, us_gas_avg_gallon: 3.22, us_diesel_avg_gallon: 3.98, strait_hormuz_daily_ships: 5, iran_production_mbpd: 2.1, key_event: "IEA announces 400M barrel emergency release", war_day: 5, brent_vs_prewar_pct: 25.8, gas_vs_prewar_pct: 8.1, gas_change_from_prewar_dollars: 0.24, phase: "Week 1 Shock" },
  { date: "2026-03-05", brent_usd_barrel: 93.4, wti_usd_barrel: 86.1, dubai_usd_barrel: 92.8, us_gas_avg_gallon: 3.28, us_diesel_avg_gallon: 4.02, strait_hormuz_daily_ships: 5, iran_production_mbpd: 2.0, key_event: "DAY 6: China offers to mediate; US declines", war_day: 6, brent_vs_prewar_pct: 27.8, gas_vs_prewar_pct: 10.1, gas_change_from_prewar_dollars: 0.30, phase: "Week 1 Shock" },
  { date: "2026-03-07", brent_usd_barrel: 96.8, wti_usd_barrel: 89.2, dubai_usd_barrel: 152.3, us_gas_avg_gallon: 3.35, us_diesel_avg_gallon: 4.08, strait_hormuz_daily_ships: 5, iran_production_mbpd: 1.8, key_event: "DAY 8: Dubai crude hits all-time high above $150", war_day: 8, brent_vs_prewar_pct: 32.4, gas_vs_prewar_pct: 12.4, gas_change_from_prewar_dollars: 0.37, phase: "Week 2 Escalation" },
  { date: "2026-03-10", brent_usd_barrel: 99.8, wti_usd_barrel: 92.1, dubai_usd_barrel: 148.6, us_gas_avg_gallon: 3.42, us_diesel_avg_gallon: 4.15, strait_hormuz_daily_ships: 5, iran_production_mbpd: 1.5, key_event: "DAY 11: Brent crosses $100 for first time since 2022", war_day: 11, brent_vs_prewar_pct: 36.5, gas_vs_prewar_pct: 14.8, gas_change_from_prewar_dollars: 0.44, phase: "Week 2 Escalation" },
  { date: "2026-03-13", brent_usd_barrel: 103.2, wti_usd_barrel: 95.4, dubai_usd_barrel: 145.2, us_gas_avg_gallon: 3.48, us_diesel_avg_gallon: 4.22, strait_hormuz_daily_ships: 5, iran_production_mbpd: 1.2, key_event: "DAY 14: US allows sanctioned Iranian tanker crude", war_day: 14, brent_vs_prewar_pct: 41.2, gas_vs_prewar_pct: 16.8, gas_change_from_prewar_dollars: 0.50, phase: "Week 2 Escalation" },
  { date: "2026-03-15", brent_usd_barrel: 100.2, wti_usd_barrel: 92.8, dubai_usd_barrel: 140.8, us_gas_avg_gallon: 3.52, us_diesel_avg_gallon: 4.28, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.8, key_event: "DAY 16: Trump orders Kharg Island strikes", war_day: 16, brent_vs_prewar_pct: 37.1, gas_vs_prewar_pct: 18.1, gas_change_from_prewar_dollars: 0.54, phase: "Week 3 Peak" },
  { date: "2026-03-16", brent_usd_barrel: 105.4, wti_usd_barrel: 97.2, dubai_usd_barrel: 148.9, us_gas_avg_gallon: 3.55, us_diesel_avg_gallon: 4.32, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.5, key_event: "Houthis join strikes — threaten Red Sea tankers", war_day: 17, brent_vs_prewar_pct: 44.2, gas_vs_prewar_pct: 19.1, gas_change_from_prewar_dollars: 0.57, phase: "Week 3 Peak" },
  { date: "2026-03-18", brent_usd_barrel: 108.65, wti_usd_barrel: 100.3, dubai_usd_barrel: 155.2, us_gas_avg_gallon: 3.58, us_diesel_avg_gallon: 4.38, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.3, key_event: "DAY 19: Israel strikes South Pars gas field", war_day: 19, brent_vs_prewar_pct: 48.6, gas_vs_prewar_pct: 20.1, gas_change_from_prewar_dollars: 0.60, phase: "Week 3 Peak" },
  { date: "2026-03-19", brent_usd_barrel: 108.65, wti_usd_barrel: 100.3, dubai_usd_barrel: 155.2, us_gas_avg_gallon: 3.62, us_diesel_avg_gallon: 4.42, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.2, key_event: "DAY 20: Brent hits $119 intraday high", war_day: 20, brent_vs_prewar_pct: 48.6, gas_vs_prewar_pct: 21.5, gas_change_from_prewar_dollars: 0.64, phase: "Week 3 Peak" },
  { date: "2026-03-20", brent_usd_barrel: 110.3, wti_usd_barrel: 101.8, dubai_usd_barrel: 153.4, us_gas_avg_gallon: 3.65, us_diesel_avg_gallon: 4.45, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.2, key_event: "DAY 21: US may free sanctioned Iranian tanker oil", war_day: 21, brent_vs_prewar_pct: 50.9, gas_vs_prewar_pct: 22.5, gas_change_from_prewar_dollars: 0.67, phase: "Week 3 Peak" },
  { date: "2026-03-22", brent_usd_barrel: 109.5, wti_usd_barrel: 101.0, dubai_usd_barrel: 151.8, us_gas_avg_gallon: 3.68, us_diesel_avg_gallon: 4.48, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.2, key_event: "DAY 23: Coalition forces secure eastern Hormuz approach", war_day: 23, brent_vs_prewar_pct: 49.8, gas_vs_prewar_pct: 23.5, gas_change_from_prewar_dollars: 0.70, phase: "Week 4 Sustained" },
  { date: "2026-03-24", brent_usd_barrel: 111.45, wti_usd_barrel: 102.8, dubai_usd_barrel: 154.6, us_gas_avg_gallon: 3.72, us_diesel_avg_gallon: 4.52, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.15, key_event: "DAY 24: US-Israel cyber strike on Iranian power grid", war_day: 24, brent_vs_prewar_pct: 52.5, gas_vs_prewar_pct: 24.8, gas_change_from_prewar_dollars: 0.74, phase: "Week 4 Sustained" },
  { date: "2026-03-25", brent_usd_barrel: 100.23, wti_usd_barrel: 92.5, dubai_usd_barrel: 142.1, us_gas_avg_gallon: 3.70, us_diesel_avg_gallon: 4.50, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.15, key_event: "DAY 25: Khojir missile complex destroyed", war_day: 25, brent_vs_prewar_pct: 37.1, gas_vs_prewar_pct: 24.2, gas_change_from_prewar_dollars: 0.72, phase: "Week 4 Sustained" },
  { date: "2026-03-27", brent_usd_barrel: 112.1, wti_usd_barrel: 103.4, dubai_usd_barrel: 156.2, us_gas_avg_gallon: 3.78, us_diesel_avg_gallon: 4.58, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.1, key_event: "DAY 27: Houthis launch drone swarm at Red Sea tankers", war_day: 27, brent_vs_prewar_pct: 53.4, gas_vs_prewar_pct: 26.8, gas_change_from_prewar_dollars: 0.80, phase: "Week 4 Sustained" },
  { date: "2026-03-28", brent_usd_barrel: 105.32, wti_usd_barrel: 97.1, dubai_usd_barrel: 148.4, us_gas_avg_gallon: 3.75, us_diesel_avg_gallon: 4.55, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.1, key_event: "DAY 28: Operation Epic Fury — 850+ Tomahawks launched", war_day: 28, brent_vs_prewar_pct: 44.1, gas_vs_prewar_pct: 25.8, gas_change_from_prewar_dollars: 0.77, phase: "Week 4 Sustained" },
  { date: "2026-03-30", brent_usd_barrel: 112.8, wti_usd_barrel: 104.1, dubai_usd_barrel: 157.3, us_gas_avg_gallon: 3.82, us_diesel_avg_gallon: 4.62, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.1, key_event: "DAY 30: IRGC strikes Bahrain & UAE aluminium plants", war_day: 30, brent_vs_prewar_pct: 54.3, gas_vs_prewar_pct: 28.2, gas_change_from_prewar_dollars: 0.84, phase: "Week 5 Escalation" },
  { date: "2026-03-31", brent_usd_barrel: 113.29, wti_usd_barrel: 104.5, dubai_usd_barrel: 158.1, us_gas_avg_gallon: 3.85, us_diesel_avg_gallon: 4.65, strait_hormuz_daily_ships: 5, iran_production_mbpd: 0.1, key_event: "DAY 32: Israel invades Lebanon; UNIFIL peacekeeper killed", war_day: 32, brent_vs_prewar_pct: 55.0, gas_vs_prewar_pct: 29.2, gas_change_from_prewar_dollars: 0.87, phase: "Week 5 Escalation" },
  { date: "2026-04-01", brent_usd_barrel: 115.6, wti_usd_barrel: 106.8, dubai_usd_barrel: 160.4, us_gas_avg_gallon: 3.92, us_diesel_avg_gallon: 4.72, strait_hormuz_daily_ships: 3, iran_production_mbpd: 0.08, key_event: "DAY 33: US strikes Bushehr nuclear power plant", war_day: 33, brent_vs_prewar_pct: 58.1, gas_vs_prewar_pct: 31.5, gas_change_from_prewar_dollars: 0.94, phase: "Week 5 Escalation" },
];

// Local fallback/additional timeline events
export const localTimelineEvents: TimelineEvent[] = [
  { id: 9001, date: 20260401, eventTitle: "US strikes Bushehr nuclear power plant", description: "US launches precision strikes on Iran's Bushehr nuclear facility, raising fears of radioactive contamination and triggering global condemnation.", warDay: 33, category: "Military Escalation", brentPriceThatDay: 115.6, source: "Local" },
];

// Predictions based on notebook analysis
export const predictions = [
  { scenario: "Ceasefire within 30 days", brentTarget: "$85–95", gasTarget: "$3.20–3.40", probability: "25%", color: "crisis-green" as const },
  { scenario: "Prolonged conflict (60+ days)", brentTarget: "$120–140", gasTarget: "$4.50–5.00", probability: "45%", color: "crisis-red" as const },
  { scenario: "Hormuz reopens partially", brentTarget: "$95–105", gasTarget: "$3.40–3.80", probability: "20%", color: "crisis-amber" as const },
  { scenario: "Full regional escalation", brentTarget: "$150+", gasTarget: "$5.50+", probability: "10%", color: "crisis-red" as const },
];
