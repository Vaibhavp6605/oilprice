
-- Oil events table for timeline
CREATE TABLE public.oil_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  event_title TEXT NOT NULL,
  description TEXT NOT NULL,
  war_day INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'Military Escalation',
  brent_price_that_day NUMERIC(8,2),
  source TEXT DEFAULT 'AI-generated',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily snapshots table
CREATE TABLE public.daily_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL UNIQUE,
  brent_usd NUMERIC(8,2),
  wti_usd NUMERIC(8,2),
  dubai_usd NUMERIC(8,2),
  gas_avg NUMERIC(6,3),
  diesel_avg NUMERIC(6,3),
  hormuz_ships INTEGER,
  iran_production NUMERIC(5,2),
  key_event TEXT,
  war_day INTEGER NOT NULL,
  phase TEXT DEFAULT 'Ongoing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.oil_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read access (public dashboard)
CREATE POLICY "Anyone can view oil events" ON public.oil_events FOR SELECT USING (true);
CREATE POLICY "Anyone can view daily snapshots" ON public.daily_snapshots FOR SELECT USING (true);

-- Service role can insert/update (edge functions)
CREATE POLICY "Service role can insert oil events" ON public.oil_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert daily snapshots" ON public.daily_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update daily snapshots" ON public.daily_snapshots FOR UPDATE USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.oil_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_snapshots;
