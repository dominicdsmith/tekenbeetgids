ALTER TABLE public.provincie_cijfers
  ADD COLUMN IF NOT EXISTS habitat_factor numeric NOT NULL DEFAULT 1.0;

UPDATE public.provincie_cijfers SET habitat_factor = v.f
FROM (VALUES
  ('drenthe', 1.40),
  ('overijssel', 1.40),
  ('gelderland', 1.40),
  ('utrecht', 1.20),
  ('noordholland', 1.20),
  ('flevoland', 1.15),
  ('limburg', 1.10),
  ('noordbrabant', 1.10),
  ('friesland', 1.05),
  ('groningen', 1.00),
  ('zeeland', 1.00),
  ('zuidholland', 0.95)
) AS v(id, f)
WHERE public.provincie_cijfers.provincie_id = v.id;