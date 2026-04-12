-- Clean day 41 duplicates
DELETE FROM oil_events
WHERE id NOT IN (
  SELECT DISTINCT ON (war_day, category) id
  FROM oil_events
  WHERE war_day = 41
  ORDER BY war_day, category, created_at ASC
)
AND war_day = 41;

-- Add authentic Day 44 events from real sources (April 12)
INSERT INTO oil_events (event_date, event_title, description, war_day, category, brent_price_that_day, source)
VALUES
('2026-04-12', 'Energy Prices May Take Months to Normalize Despite Ceasefire', 'Analysts warn that even with the fragile US-Iran ceasefire, energy prices could take months to return to pre-war levels due to infrastructure damage and insurance risk premiums.', 44, 'Price Milestone', 138.21, 'Al Jazeera')
ON CONFLICT DO NOTHING;

INSERT INTO oil_events (event_date, event_title, description, war_day, category, brent_price_that_day, source)
VALUES
('2026-04-12', 'Ceasefire Confusion: Iran Threatens to Close Hormuz Again Over Israeli Lebanon Strikes', 'Disagreements over whether the ceasefire covers Israeli operations in Lebanon threaten to unravel the US-Iran deal, with Tehran warning of renewed Hormuz closure.', 44, 'Military Escalation', 138.21, 'Foreign Policy')
ON CONFLICT DO NOTHING;