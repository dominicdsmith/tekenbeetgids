CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE TABLE public.interne_sleutels (
  naam text PRIMARY KEY,
  waarde text NOT NULL
);
REVOKE ALL ON public.interne_sleutels FROM anon, authenticated;
GRANT ALL ON public.interne_sleutels TO service_role;
ALTER TABLE public.interne_sleutels ENABLE ROW LEVEL SECURITY;
INSERT INTO public.interne_sleutels (naam, waarde)
VALUES ('cron', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (naam) DO NOTHING;

SELECT cron.unschedule('databroncontrole-uurlijks');
SELECT cron.unschedule('beveiligingsscan-dagelijks');

SELECT cron.schedule('databroncontrole-uurlijks', '5 * * * *', $cron$
  SELECT net.http_post(
    url := 'https://project--e08fb913-d993-4e51-953f-16fe348d192c.lovable.app/api/public/hooks/data-controle',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-token', (SELECT waarde FROM public.interne_sleutels WHERE naam = 'cron')),
    body := '{}'::jsonb
  ) as request_id;
$cron$);

SELECT cron.schedule('beveiligingsscan-dagelijks', '25 3 * * *', $cron$
  SELECT net.http_post(
    url := 'https://project--e08fb913-d993-4e51-953f-16fe348d192c.lovable.app/api/public/hooks/beveiligingsscan',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-token', (SELECT waarde FROM public.interne_sleutels WHERE naam = 'cron')),
    body := '{}'::jsonb
  ) as request_id;
$cron$);