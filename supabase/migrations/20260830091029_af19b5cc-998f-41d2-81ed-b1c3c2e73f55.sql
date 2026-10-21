CREATE TABLE public.onderzoek_deelnames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deelnamenummer text NOT NULL UNIQUE,
  taal text NOT NULL DEFAULT 'nl',
  rapport text NOT NULL,
  gegevens jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.onderzoek_deelnames TO service_role;
GRANT SELECT ON public.onderzoek_deelnames TO authenticated;

ALTER TABLE public.onderzoek_deelnames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins lezen onderzoeksdeelnames" ON public.onderzoek_deelnames FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Geen directe inserts op onderzoeksdeelnames" ON public.onderzoek_deelnames FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Geen wijzigingen op onderzoeksdeelnames" ON public.onderzoek_deelnames FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Geen verwijderen van onderzoeksdeelnames" ON public.onderzoek_deelnames FOR DELETE TO anon, authenticated USING (false);