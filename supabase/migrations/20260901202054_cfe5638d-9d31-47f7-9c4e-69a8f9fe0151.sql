CREATE TABLE public.ziekte_cijfers (
  ziekte_id text PRIMARY KEY,
  pct text NOT NULL,
  pct_noot text,
  risk jsonb NOT NULL DEFAULT '{}'::jsonb,
  bron text,
  periode text,
  bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ziekte_cijfers TO anon, authenticated;
GRANT ALL ON public.ziekte_cijfers TO service_role;
ALTER TABLE public.ziekte_cijfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ziektecijfers openbaar leesbaar" ON public.ziekte_cijfers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Ziektecijfers niet invoegen" ON public.ziekte_cijfers FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Ziektecijfers niet wijzigen" ON public.ziekte_cijfers FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Ziektecijfers niet verwijderen" ON public.ziekte_cijfers FOR DELETE TO anon, authenticated USING (false);

CREATE TABLE public.provincie_cijfers (
  provincie_id text PRIMARY KEY,
  meldingen integer,
  tekenbeet_aantal integer,
  risk integer,
  bron text,
  periode text,
  bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provincie_cijfers TO anon, authenticated;
GRANT ALL ON public.provincie_cijfers TO service_role;
ALTER TABLE public.provincie_cijfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Provinciecijfers openbaar leesbaar" ON public.provincie_cijfers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Provinciecijfers niet invoegen" ON public.provincie_cijfers FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Provinciecijfers niet wijzigen" ON public.provincie_cijfers FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Provinciecijfers niet verwijderen" ON public.provincie_cijfers FOR DELETE TO anon, authenticated USING (false);

CREATE TABLE public.tekenbeet_tellingen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  datum date NOT NULL DEFAULT current_date,
  maand integer NOT NULL DEFAULT EXTRACT(month FROM current_date),
  jaar integer NOT NULL DEFAULT EXTRACT(year FROM current_date),
  provincie_id text,
  plaats text,
  soort text,
  bron text NOT NULL DEFAULT 'scan',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tekenbeet_tellingen_jaar_maand_idx ON public.tekenbeet_tellingen (jaar, maand);
GRANT SELECT ON public.tekenbeet_tellingen TO anon, authenticated;
GRANT ALL ON public.tekenbeet_tellingen TO service_role;
ALTER TABLE public.tekenbeet_tellingen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tellingen openbaar leesbaar" ON public.tekenbeet_tellingen FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Tellingen niet invoegen" ON public.tekenbeet_tellingen FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Tellingen niet wijzigen" ON public.tekenbeet_tellingen FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Tellingen niet verwijderen" ON public.tekenbeet_tellingen FOR DELETE TO anon, authenticated USING (false);