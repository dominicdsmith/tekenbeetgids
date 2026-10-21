ALTER TABLE public.provincie_cijfers
  ADD COLUMN IF NOT EXISTS inwoners integer,
  ADD COLUMN IF NOT EXISTS tbe_gevallen integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meldingen_per_100k numeric,
  ADD COLUMN IF NOT EXISTS tbe_per_100k numeric,
  ADD COLUMN IF NOT EXISTS klasse_bron text;

UPDATE public.provincie_cijfers SET inwoners = v.inw, tbe_gevallen = v.tbe
FROM (VALUES
  ('groningen', 605000, 0),
  ('friesland', 662000, 1),
  ('drenthe', 504000, 0),
  ('overijssel', 1190000, 2),
  ('flevoland', 448000, 1),
  ('gelderland', 2120000, 2),
  ('utrecht', 1410000, 3),
  ('noordholland', 2970000, 1),
  ('zuidholland', 3830000, 0),
  ('zeeland', 393000, 0),
  ('noordbrabant', 2610000, 0),
  ('limburg', 1130000, 0)
) AS v(id, inw, tbe)
WHERE public.provincie_cijfers.provincie_id = v.id;

UPDATE public.provincie_cijfers
SET meldingen_per_100k = ROUND((meldingen::numeric / inwoners) * 100000, 1),
    tbe_per_100k = ROUND((tbe_gevallen::numeric / inwoners) * 100000, 2)
WHERE inwoners IS NOT NULL AND inwoners > 0;