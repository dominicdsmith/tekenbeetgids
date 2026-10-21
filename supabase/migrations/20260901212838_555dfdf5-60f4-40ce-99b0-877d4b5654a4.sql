select cron.unschedule(1);
select cron.schedule(
  'databroncontrole-uurlijks',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--e08fb913-d993-4e51-953f-16fe348d192c.lovable.app/api/public/hooks/data-controle',
    headers := '{"Content-Type": "application/json", "apikey": "sb_publishable_4q8fOdglgkiHHLXb2BBWFw_Ao0SDAlb"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
alter publication supabase_realtime add table public.datastatus;
alter publication supabase_realtime add table public.databronnen;
alter table public.datastatus replica identity full;
alter table public.databronnen replica identity full;