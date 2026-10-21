-- Neem de fotoscan-cache mee in de nachtelijke opschoning.
CREATE OR REPLACE FUNCTION public.opschonen_oude_gegevens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.tekenbeet_registraties WHERE created_at < now() - interval '5 years';
  DELETE FROM public.onderzoek_deelnames WHERE created_at < now() - interval '5 years';
  DELETE FROM public.datacontrole_log WHERE uitgevoerd_op < now() - interval '30 days';
  DELETE FROM public.contact_rate_limit WHERE window_start < now() - interval '1 day';
  DELETE FROM public.privacy_verzoeken WHERE created_at < now() - interval '3 years';
  DELETE FROM public.fotoscan_cache WHERE created_at < now() - interval '24 hours';
END;
$$;