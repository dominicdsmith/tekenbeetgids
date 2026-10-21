-- Tijdelijke cache voor fotoscan-resultaten: een herhaalde upload van dezelfde foto
-- roept de AI niet opnieuw aan (kostenbegrenzing). Alleen de server mag lezen/schrijven.
CREATE TABLE public.fotoscan_cache (
  hash text PRIMARY KEY,
  soort text NOT NULL,
  taal text NOT NULL,
  resultaat jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.fotoscan_cache TO service_role;

ALTER TABLE public.fotoscan_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Niemand heeft directe toegang tot de fotoscan-cache"
ON public.fotoscan_cache
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Cache is bewust vluchtig: ouder dan 24 uur mag weg.
CREATE OR REPLACE FUNCTION public.opschonen_fotoscan_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.fotoscan_cache WHERE created_at < now() - interval '24 hours';
END;
$$;