DELETE FROM oil_events
WHERE id NOT IN (
  SELECT DISTINCT ON (war_day, category) id
  FROM oil_events
  WHERE war_day >= 42
  ORDER BY war_day, category, created_at ASC
)
AND war_day >= 42;