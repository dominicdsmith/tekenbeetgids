SELECT cron.schedule('backup-export-wekelijks', '15 2 * * 1', $cron$
  SELECT net.http_post(
    url := 'https://project--e08fb913-d993-4e51-953f-16fe348d192c.lovable.app/api/public/hooks/backup-export',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-token', (SELECT waarde FROM public.interne_sleutels WHERE naam = 'cron')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  ) as request_id;
$cron$);