CREATE TABLE public.backup_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uitgevoerd_op timestamptz NOT NULL DEFAULT now(),
  geslaagd boolean NOT NULL,
  bestand text,
  aantal_records integer,
  toelichting text
);
GRANT ALL ON public.backup_log TO service_role;
GRANT SELECT ON public.backup_log TO authenticated;
ALTER TABLE public.backup_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Backuplog alleen voor beheerders" ON public.backup_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.publieke_backuplog()
RETURNS TABLE (id uuid, uitgevoerd_op timestamptz, geslaagd boolean, bestand text, aantal_records integer, toelichting text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT b.id, b.uitgevoerd_op, b.geslaagd, b.bestand, b.aantal_records, b.toelichting
  FROM public.backup_log AS b ORDER BY b.uitgevoerd_op DESC LIMIT 60
$$;
REVOKE ALL ON FUNCTION public.publieke_backuplog() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publieke_backuplog() TO anon, authenticated;

INSERT INTO public.backup_log (uitgevoerd_op, geslaagd, bestand, toelichting)
VALUES ('2026-10-08 08:56:00+00', true, 'backup-2026-10-08-08-56.json.enc', 'Eerste versleutelde proefback-up');