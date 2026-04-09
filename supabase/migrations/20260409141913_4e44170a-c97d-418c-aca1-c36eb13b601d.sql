-- Update daily snapshots to reflect ceasefire reality
-- Day 39: Ceasefire announced, prices drop, Hormuz starts reopening
UPDATE daily_snapshots SET
  brent_usd = 112.00,
  wti_usd = 96.50,
  dubai_usd = 114.00,
  gas_avg = 3.95,
  diesel_avg = 5.20,
  hormuz_ships = 8,
  iran_production = 0.05,
  key_event = 'DAY 39: Trump Announces Two-Week Ceasefire With Iran',
  phase = 'Ceasefire Negotiations',
  updated_at = now()
WHERE war_day = 39;

-- Day 40: Ceasefire holds, ships start moving, prices continue dropping
UPDATE daily_snapshots SET
  brent_usd = 108.50,
  wti_usd = 93.20,
  dubai_usd = 110.50,
  gas_avg = 3.88,
  diesel_avg = 5.10,
  hormuz_ships = 15,
  iran_production = 0.05,
  key_event = 'DAY 40: First Commercial Ships Transit Hormuz Under Ceasefire',
  phase = 'Ceasefire Day 2',
  updated_at = now()
WHERE war_day = 40;

-- Day 41: Fragile ceasefire, Iran accuses violations, slight price uptick
UPDATE daily_snapshots SET
  brent_usd = 110.20,
  wti_usd = 94.80,
  dubai_usd = 112.20,
  gas_avg = 3.90,
  diesel_avg = 5.12,
  hormuz_ships = 25,
  iran_production = 0.08,
  key_event = 'DAY 41: Tehran Says Ceasefire Violated, Tensions Rise',
  phase = 'Ceasefire Day 3 - Fragile',
  updated_at = now()
WHERE war_day = 41;