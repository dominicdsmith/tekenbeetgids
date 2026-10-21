REVOKE ALL ON public.contact_rate_limit FROM anon;
REVOKE ALL ON public.contact_rate_limit FROM authenticated;
GRANT ALL ON public.contact_rate_limit TO service_role;

DROP POLICY IF EXISTS "Geen directe toegang tot rate limit" ON public.contact_rate_limit;

CREATE POLICY "Rate limit niet leesbaar" ON public.contact_rate_limit FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Rate limit niet invoegen" ON public.contact_rate_limit FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Rate limit niet wijzigen" ON public.contact_rate_limit FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Rate limit niet verwijderen" ON public.contact_rate_limit FOR DELETE TO anon, authenticated USING (false);