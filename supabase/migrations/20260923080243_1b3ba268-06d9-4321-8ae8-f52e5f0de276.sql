CREATE TABLE public.tekenbeet_registraties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registratienummer text NOT NULL UNIQUE,
  taal text NOT NULL DEFAULT 'nl' CHECK (taal IN ('nl', 'en')),
  overzicht text NOT NULL,
  gegevens jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tekenbeet_registraties TO authenticated;
GRANT ALL ON public.tekenbeet_registraties TO service_role;

ALTER TABLE public.tekenbeet_registraties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alleen admins lezen tekenbeetregistraties"
ON public.tekenbeet_registraties
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Geen directe registratie-inserts"
ON public.tekenbeet_registraties
FOR INSERT TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Geen directe registratiewijzigingen"
ON public.tekenbeet_registraties
FOR UPDATE TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "Geen directe registratieverwijderingen"
ON public.tekenbeet_registraties
FOR DELETE TO anon, authenticated
USING (false);