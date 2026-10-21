CREATE TABLE public.datastatus (
  id integer PRIMARY KEY CHECK (id = 1),
  peildatum text NOT NULL,
  laatst_bijgewerkt text NOT NULL,
  laatste_controle timestamptz,
  wijziging_gevonden boolean NOT NULL DEFAULT false,
  lock_tot timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.datastatus TO anon, authenticated;
GRANT ALL ON public.datastatus TO service_role;
ALTER TABLE public.datastatus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Datastatus is openbaar leesbaar" ON public.datastatus FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Datastatus niet wijzigen" ON public.datastatus FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Datastatus niet invoegen" ON public.datastatus FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Datastatus niet verwijderen" ON public.datastatus FOR DELETE TO anon, authenticated USING (false);

CREATE TABLE public.databronnen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sleutel text NOT NULL UNIQUE,
  naam text NOT NULL,
  url text NOT NULL,
  volgorde integer NOT NULL DEFAULT 0,
  vingerafdruk text,
  status text NOT NULL DEFAULT 'onbekend',
  laatst_gecontroleerd timestamptz,
  laatst_gewijzigd timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.databronnen TO anon, authenticated;
GRANT ALL ON public.databronnen TO service_role;
ALTER TABLE public.databronnen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Databronnen zijn openbaar leesbaar" ON public.databronnen FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Databronnen niet wijzigen" ON public.databronnen FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Databronnen niet invoegen" ON public.databronnen FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Databronnen niet verwijderen" ON public.databronnen FOR DELETE TO anon, authenticated USING (false);

CREATE TABLE public.datacontrole_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uitgevoerd_op timestamptz NOT NULL DEFAULT now(),
  bron_sleutel text NOT NULL,
  resultaat text NOT NULL,
  detail jsonb
);
GRANT SELECT ON public.datacontrole_log TO authenticated;
GRANT ALL ON public.datacontrole_log TO service_role;
ALTER TABLE public.datacontrole_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Beheerders lezen controlelog" ON public.datacontrole_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Controlelog niet wijzigen" ON public.datacontrole_log FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Controlelog niet invoegen" ON public.datacontrole_log FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Controlelog niet verwijderen" ON public.datacontrole_log FOR DELETE TO anon, authenticated USING (false);

INSERT INTO public.datastatus (id, peildatum, laatst_bijgewerkt)
VALUES (1, '21 augustus 2026', '21 augustus 2026');

INSERT INTO public.databronnen (sleutel, naam, url, volgorde) VALUES
  ('stz', 'Stichting Tekenbeetziekten', 'https://www.tekenbeetziekten.nl/cijfers/', 1),
  ('lymevereniging', 'Lymevereniging', 'https://lymevereniging.nl/', 2),
  ('rivm_lyme', 'RIVM — Lyme', 'https://www.rivm.nl/ziekte-van-lyme', 3),
  ('lci_tbe', 'RIVM/LCI-richtlijn tekenencefalitis (TBE)', 'https://lci.rivm.nl/richtlijnen/tekenencefalitis', 4),
  ('tekenradar', 'Tekenradar.nl (RIVM en WUR)', 'https://www.tekenradar.nl/', 5),
  ('wur', 'Nederlands Kennisnetwerk / Wageningen University & Research', 'https://www.wur.nl/nl/onderzoek-resultaten/onderzoeksinstituten/environmental-research/teken-en-tekenbeten.htm', 6);