CREATE TABLE public.privacy_verzoeken (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verzoeknummer text NOT NULL UNIQUE,
  soort text NOT NULL DEFAULT 'klacht',
  naam text NOT NULL,
  email text NOT NULL,
  bericht text NOT NULL,
  taal text NOT NULL DEFAULT 'nl',
  ip_hash text,
  status text NOT NULL DEFAULT 'Ontvangen',
  afgehandeld_op timestamp with time zone,
  contact_referentie text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.privacy_verzoeken TO authenticated;
GRANT ALL ON public.privacy_verzoeken TO service_role;

ALTER TABLE public.privacy_verzoeken ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins lezen privacyverzoeken" ON public.privacy_verzoeken
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins werken privacyverzoeken bij" ON public.privacy_verzoeken
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins verwijderen privacyverzoeken" ON public.privacy_verzoeken
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Geen directe inserts op privacyverzoeken" ON public.privacy_verzoeken
  FOR INSERT TO anon, authenticated WITH CHECK (false);

CREATE INDEX privacy_verzoeken_created_idx ON public.privacy_verzoeken (created_at DESC);

CREATE OR REPLACE FUNCTION public.zet_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_privacy_verzoeken_updated_at
  BEFORE UPDATE ON public.privacy_verzoeken
  FOR EACH ROW EXECUTE FUNCTION public.zet_updated_at();

CREATE OR REPLACE FUNCTION public.opschonen_oude_gegevens()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.tekenbeet_registraties WHERE created_at < now() - interval '5 years';
  DELETE FROM public.onderzoek_deelnames WHERE created_at < now() - interval '5 years';
  DELETE FROM public.datacontrole_log WHERE uitgevoerd_op < now() - interval '30 days';
  DELETE FROM public.contact_rate_limit WHERE window_start < now() - interval '1 day';
  DELETE FROM public.privacy_verzoeken WHERE created_at < now() - interval '3 years';
END;
$function$;