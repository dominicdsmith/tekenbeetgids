CREATE TABLE public.tekenradar_cijfers (
  jaar integer PRIMARY KEY,
  meldingen integer NOT NULL,
  per_maand jsonb NOT NULL DEFAULT '[]'::jsonb,
  verandering_pct numeric,
  bron text,
  periode text,
  bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tekenradar_cijfers TO anon, authenticated;
GRANT ALL ON public.tekenradar_cijfers TO service_role;
ALTER TABLE public.tekenradar_cijfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tekenradarcijfers openbaar leesbaar" ON public.tekenradar_cijfers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Tekenradarcijfers niet invoegen" ON public.tekenradar_cijfers FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Tekenradarcijfers niet wijzigen" ON public.tekenradar_cijfers FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Tekenradarcijfers niet verwijderen" ON public.tekenradar_cijfers FOR DELETE TO anon, authenticated USING (false);