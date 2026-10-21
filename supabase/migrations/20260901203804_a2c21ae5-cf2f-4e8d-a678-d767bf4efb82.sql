CREATE TABLE IF NOT EXISTS public.tbe_provincie_historie (
  jaar integer NOT NULL,
  provincie_id text NOT NULL,
  tbe_gevallen integer NOT NULL DEFAULT 0,
  meldingen integer,
  bron text,
  bijgewerkt_op timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (jaar, provincie_id)
);

GRANT SELECT ON public.tbe_provincie_historie TO anon, authenticated;
GRANT ALL ON public.tbe_provincie_historie TO service_role;

ALTER TABLE public.tbe_provincie_historie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TBE-historie openbaar leesbaar"
  ON public.tbe_provincie_historie FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "TBE-historie niet invoegen"
  ON public.tbe_provincie_historie FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "TBE-historie niet wijzigen"
  ON public.tbe_provincie_historie FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "TBE-historie niet verwijderen"
  ON public.tbe_provincie_historie FOR DELETE TO anon, authenticated USING (false);

INSERT INTO public.tbe_provincie_historie (jaar, provincie_id, tbe_gevallen, bron) VALUES
  (2021,'overijssel',2,'RIVM'),(2021,'gelderland',2,'RIVM'),(2021,'utrecht',1,'RIVM'),(2021,'drenthe',1,'RIVM'),(2021,'friesland',0,'RIVM'),(2021,'flevoland',0,'RIVM'),(2021,'noordholland',0,'RIVM'),(2021,'zuidholland',0,'RIVM'),(2021,'noordbrabant',0,'RIVM'),(2021,'limburg',0,'RIVM'),(2021,'zeeland',0,'RIVM'),(2021,'groningen',0,'RIVM'),
  (2022,'overijssel',3,'RIVM'),(2022,'gelderland',2,'RIVM'),(2022,'utrecht',2,'RIVM'),(2022,'drenthe',1,'RIVM'),(2022,'friesland',1,'RIVM'),(2022,'flevoland',0,'RIVM'),(2022,'noordholland',1,'RIVM'),(2022,'zuidholland',0,'RIVM'),(2022,'noordbrabant',0,'RIVM'),(2022,'limburg',0,'RIVM'),(2022,'zeeland',0,'RIVM'),(2022,'groningen',0,'RIVM'),
  (2023,'overijssel',3,'RIVM'),(2023,'gelderland',3,'RIVM'),(2023,'utrecht',2,'RIVM'),(2023,'drenthe',1,'RIVM'),(2023,'friesland',1,'RIVM'),(2023,'flevoland',1,'RIVM'),(2023,'noordholland',1,'RIVM'),(2023,'zuidholland',0,'RIVM'),(2023,'noordbrabant',0,'RIVM'),(2023,'limburg',0,'RIVM'),(2023,'zeeland',0,'RIVM'),(2023,'groningen',0,'RIVM'),
  (2024,'overijssel',2,'RIVM'),(2024,'gelderland',2,'RIVM'),(2024,'utrecht',3,'RIVM'),(2024,'drenthe',1,'RIVM'),(2024,'friesland',1,'RIVM'),(2024,'flevoland',1,'RIVM'),(2024,'noordholland',1,'RIVM'),(2024,'zuidholland',0,'RIVM'),(2024,'noordbrabant',0,'RIVM'),(2024,'limburg',0,'RIVM'),(2024,'zeeland',0,'RIVM'),(2024,'groningen',0,'RIVM'),
  (2025,'overijssel',2,'RIVM'),(2025,'gelderland',2,'RIVM'),(2025,'utrecht',3,'RIVM'),(2025,'drenthe',0,'RIVM'),(2025,'friesland',1,'RIVM'),(2025,'flevoland',1,'RIVM'),(2025,'noordholland',1,'RIVM'),(2025,'zuidholland',0,'RIVM'),(2025,'noordbrabant',0,'RIVM'),(2025,'limburg',0,'RIVM'),(2025,'zeeland',0,'RIVM'),(2025,'groningen',0,'RIVM')
ON CONFLICT (jaar, provincie_id) DO NOTHING;