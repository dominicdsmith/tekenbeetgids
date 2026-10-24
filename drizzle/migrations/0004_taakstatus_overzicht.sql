CREATE OR REPLACE FUNCTION public.taakstatus_overzicht()
RETURNS TABLE(taak text, schema_cron text, actief boolean, laatste_status text, laatste_start timestamptz, laatste_einde timestamptz, mislukt_7d bigint, runs_7d bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, cron
AS $$
  SELECT j.jobname::text, j.schedule::text, j.active,
    l.status::text, l.start_time, l.end_time,
    (SELECT count(*) FROM cron.job_run_details d WHERE d.jobid = j.jobid AND d.status <> 'succeeded' AND d.start_time > now() - interval '7 days'),
    (SELECT count(*) FROM cron.job_run_details d WHERE d.jobid = j.jobid AND d.start_time > now() - interval '7 days')
  FROM cron.job j
  LEFT JOIN LATERAL (SELECT status, start_time, end_time FROM cron.job_run_details d WHERE d.jobid = j.jobid ORDER BY start_time DESC LIMIT 1) l ON true
  ORDER BY j.jobname;
$$;
REVOKE ALL ON FUNCTION public.taakstatus_overzicht() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.taakstatus_overzicht() TO service_role;

SELECT cron.schedule('taakstatus-google-elk-uur', '50 * * * *', $c$
  SELECT net.http_post(
    url := 'https://project--e08fb913-d993-4e51-953f-16fe348d192c.lovable.app/api/public/hooks/taakstatus-google',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-token', (SELECT waarde FROM public.interne_sleutels WHERE naam = 'cron')),
    body := '{}'::jsonb
  ) as request_id;
$c$);