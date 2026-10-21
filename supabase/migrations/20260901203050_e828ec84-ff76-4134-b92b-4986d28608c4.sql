ALTER TABLE public.ziekte_cijfers
  ADD COLUMN IF NOT EXISTS naam text,
  ADD COLUMN IF NOT EXISTS volgorde integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS actief boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS bron_url text;

UPDATE public.ziekte_cijfers SET naam = v.naam, volgorde = v.volgorde
FROM (VALUES
  ('lyme','Ziekte van Lyme',1),
  ('tbe','TBE – Tekenencefalitis',2),
  ('rickettsia','Rickettsiose',3),
  ('neoehrlichia','Neoehrlichiose',4),
  ('babesia','Babesiose',5),
  ('miyamotoi','Borrelia miyamotoi-ziekte',6),
  ('anaplasma','Anaplasmose',7),
  ('bartonella','Bartonellose',8),
  ('tularemie','Tularemie',9),
  ('alfagal','Alfa-galsyndroom',10),
  ('cchf','CCHF – Krim-Congo hemorragische koorts',11)
) AS v(id, naam, volgorde)
WHERE public.ziekte_cijfers.ziekte_id = v.id;