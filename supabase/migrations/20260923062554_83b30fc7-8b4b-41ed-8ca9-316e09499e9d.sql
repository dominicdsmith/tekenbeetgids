REVOKE EXECUTE ON FUNCTION public.publieke_beveiligingsscans() FROM anon, authenticated;
DROP FUNCTION public.publieke_beveiligingsscans();

GRANT SELECT ON public.beveiligingsscans TO anon;
DROP POLICY IF EXISTS "Beveiligingsscans alleen voor ingelogde beheerders" ON public.beveiligingsscans;
CREATE POLICY "Recente beveiligingsscans openbaar leesbaar"
  ON public.beveiligingsscans
  FOR SELECT
  TO anon, authenticated
  USING (uitgevoerd_op >= now() - interval '2 years');