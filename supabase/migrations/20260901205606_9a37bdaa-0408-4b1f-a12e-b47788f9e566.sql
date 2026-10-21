ALTER TABLE public.ziekte_provincie_meldingen
  ALTER COLUMN jaar SET DEFAULT EXTRACT(year FROM CURRENT_DATE)::int;

UPDATE public.ziekte_provincie_meldingen
  SET jaar = EXTRACT(year FROM CURRENT_DATE)::int
  WHERE jaar IS NULL;

ALTER TABLE public.ziekte_provincie_meldingen
  ALTER COLUMN jaar SET NOT NULL;

ALTER TABLE public.ziekte_provincie_meldingen
  DROP CONSTRAINT ziekte_provincie_meldingen_pkey;

ALTER TABLE public.ziekte_provincie_meldingen
  ADD CONSTRAINT ziekte_provincie_meldingen_pkey PRIMARY KEY (ziekte_id, provincie_id, jaar);

CREATE INDEX IF NOT EXISTS ziekte_provincie_meldingen_jaar_idx
  ON public.ziekte_provincie_meldingen (ziekte_id, jaar);