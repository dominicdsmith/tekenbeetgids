-- contact_berichten: fail-closed, expliciet
REVOKE INSERT, UPDATE, TRUNCATE, REFERENCES ON public.contact_berichten FROM anon, authenticated;
REVOKE ALL ON public.contact_berichten FROM anon;
GRANT SELECT, DELETE ON public.contact_berichten TO authenticated;
GRANT ALL ON public.contact_berichten TO service_role;

CREATE POLICY "Geen directe inserts op contactberichten"
ON public.contact_berichten FOR INSERT TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Geen wijzigingen op contactberichten"
ON public.contact_berichten FOR UPDATE TO anon, authenticated
USING (false) WITH CHECK (false);

-- contact_rate_limit: volledig server-only
REVOKE ALL ON public.contact_rate_limit FROM anon, authenticated;
GRANT ALL ON public.contact_rate_limit TO service_role;

-- user_roles: alleen lezen van eigen rol; nooit zelf toekennen
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES ON public.user_roles FROM anon, authenticated;
REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

CREATE POLICY "Rollen niet zelf toekennen"
ON public.user_roles FOR INSERT TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Rollen niet zelf wijzigen"
ON public.user_roles FOR UPDATE TO anon, authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "Rollen niet zelf verwijderen"
ON public.user_roles FOR DELETE TO anon, authenticated
USING (false);

-- has_role: niet uitvoerbaar voor niet-ingelogde bezoekers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;