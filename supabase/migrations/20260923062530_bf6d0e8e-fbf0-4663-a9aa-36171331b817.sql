REVOKE SELECT ON public.beveiligingsscans FROM anon;
DROP POLICY IF EXISTS "Beveiligingsscans openbaar leesbaar" ON public.beveiligingsscans;
CREATE POLICY "Beveiligingsscans alleen voor ingelogde beheerders"
  ON public.beveiligingsscans
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.publieke_beveiligingsscans()
RETURNS TABLE (
  id uuid,
  uitgevoerd_op timestamptz,
  release text,
  commit text,
  scanners text[],
  waarschuwingen jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.uitgevoerd_op,
    b.release,
    b.commit,
    b.scanners,
    b.waarschuwingen
  FROM public.beveiligingsscans AS b
  ORDER BY b.uitgevoerd_op DESC
  LIMIT 50
$$;

REVOKE ALL ON FUNCTION public.publieke_beveiligingsscans() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publieke_beveiligingsscans() TO anon, authenticated;