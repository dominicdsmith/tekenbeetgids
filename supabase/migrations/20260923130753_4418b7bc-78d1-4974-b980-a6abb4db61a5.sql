CREATE OR REPLACE FUNCTION public.opschonen_oude_gegevens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.tekenbeet_registraties WHERE created_at < now() - interval '5 years';
  DELETE FROM public.onderzoek_deelnames WHERE created_at < now() - interval '5 years';
  DELETE FROM public.datacontrole_log WHERE uitgevoerd_op < now() - interval '30 days';
  DELETE FROM public.contact_rate_limit WHERE window_start < now() - interval '1 day';
END;
$$;

REVOKE ALL ON FUNCTION public.opschonen_oude_gegevens() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule('opschonen-oude-gegevens') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'opschonen-oude-gegevens');

SELECT cron.schedule('opschonen-oude-gegevens', '15 3 * * *', $$SELECT public.opschonen_oude_gegevens();$$);