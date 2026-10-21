CREATE TABLE IF NOT EXISTS public.ziekte_provincie_meldingen (
  ziekte_id text NOT NULL,
  provincie_id text NOT NULL,
  meldingen integer NOT NULL DEFAULT 0,
  jaar integer,
  geschat boolean NOT NULL DEFAULT false,
  bron text,
  bijgewerkt_op timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (ziekte_id, provincie_id)
);

GRANT SELECT ON public.ziekte_provincie_meldingen TO anon, authenticated;
GRANT ALL ON public.ziekte_provincie_meldingen TO service_role;

ALTER TABLE public.ziekte_provincie_meldingen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ziekte-provinciecijfers openbaar leesbaar"
  ON public.ziekte_provincie_meldingen FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Ziekte-provinciecijfers niet invoegen"
  ON public.ziekte_provincie_meldingen FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Ziekte-provinciecijfers niet wijzigen"
  ON public.ziekte_provincie_meldingen FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Ziekte-provinciecijfers niet verwijderen"
  ON public.ziekte_provincie_meldingen FOR DELETE TO anon, authenticated USING (false);