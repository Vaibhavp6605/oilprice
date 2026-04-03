
-- Drop overly permissive policies
DROP POLICY "Service role can insert oil events" ON public.oil_events;
DROP POLICY "Service role can insert daily snapshots" ON public.daily_snapshots;
DROP POLICY "Service role can update daily snapshots" ON public.daily_snapshots;

-- Recreate with service_role restriction
CREATE POLICY "Service role can insert oil events" ON public.oil_events FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert daily snapshots" ON public.daily_snapshots FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update daily snapshots" ON public.daily_snapshots FOR UPDATE TO service_role USING (true);
