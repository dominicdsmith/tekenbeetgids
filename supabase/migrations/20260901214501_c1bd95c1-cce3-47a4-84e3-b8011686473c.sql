create table if not exists public.beveiligingsscans (
  id uuid primary key default gen_random_uuid(),
  uitgevoerd_op timestamptz not null default now(),
  release text not null default 'automatisch',
  commit text not null default 'auto-scan',
  scanners text[] not null default '{}',
  waarschuwingen jsonb not null default '[]'::jsonb,
  samenvatting text
);

grant select on public.beveiligingsscans to anon;
grant select on public.beveiligingsscans to authenticated;
grant all on public.beveiligingsscans to service_role;

alter table public.beveiligingsscans enable row level security;

create policy "Beveiligingsscans openbaar leesbaar"
  on public.beveiligingsscans for select to anon, authenticated using (true);
create policy "Beveiligingsscans niet invoegen"
  on public.beveiligingsscans for insert to anon, authenticated with check (false);
create policy "Beveiligingsscans niet wijzigen"
  on public.beveiligingsscans for update to anon, authenticated using (false) with check (false);
create policy "Beveiligingsscans niet verwijderen"
  on public.beveiligingsscans for delete to anon, authenticated using (false);

create or replace function public.beveiligingscontrole()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $fn$
declare
  bevindingen jsonb := '[]'::jsonb;
  r record;
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'Niet toegestaan';
  end if;

  for r in
    select c.relname as naam
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  loop
    bevindingen := bevindingen || jsonb_build_object(
      'titel', 'Tabel zonder rijbeveiliging: ' || r.naam,
      'niveau', 'kritiek',
      'status', 'open',
      'toelichting', 'Voor deze gegevenslijst staan de toegangsregels uit; iedereen zou de inhoud kunnen opvragen.'
    );
  end loop;

  for r in
    select c.relname as naam
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
      and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname)
  loop
    bevindingen := bevindingen || jsonb_build_object(
      'titel', 'Tabel zonder toegangsregels: ' || r.naam,
      'niveau', 'waarschuwing',
      'status', 'open',
      'toelichting', 'De lijst is volledig afgesloten omdat er geen enkele toegangsregel is ingesteld.'
    );
  end loop;

  for r in
    select p.proname as naam
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
      and not exists (
        select 1 from unnest(coalesce(p.proconfig, '{}')) cfg where cfg like 'search_path=%'
      )
  loop
    bevindingen := bevindingen || jsonb_build_object(
      'titel', 'Functie met verhoogde rechten zonder vast zoekpad: ' || r.naam,
      'niveau', 'waarschuwing',
      'status', 'open',
      'toelichting', 'Deze functie draait met extra rechten; zonder vast zoekpad is misbruik theoretisch mogelijk.'
    );
  end loop;

  for r in
    select e.extname as naam
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where n.nspname = 'public'
  loop
    bevindingen := bevindingen || jsonb_build_object(
      'titel', 'Extensie in openbaar schema: ' || r.naam,
      'niveau', 'waarschuwing',
      'status', 'geaccepteerd',
      'toelichting', 'Bestaande platforminstelling van de database, niet door de website veroorzaakt.'
    );
  end loop;

  return bevindingen;
end;
$fn$;

revoke all on function public.beveiligingscontrole() from public;
revoke all on function public.beveiligingscontrole() from anon;
revoke all on function public.beveiligingscontrole() from authenticated;
grant execute on function public.beveiligingscontrole() to service_role;

alter publication supabase_realtime add table public.beveiligingsscans;
alter table public.beveiligingsscans replica identity full;

select cron.schedule(
  'beveiligingsscan-dagelijks',
  '25 3 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://project--e08fb913-d993-4e51-953f-16fe348d192c.lovable.app/api/public/hooks/beveiligingsscan',
    headers := '{"Content-Type": "application/json", "apikey": "sb_publishable_4q8fOdglgkiHHLXb2BBWFw_Ao0SDAlb"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $cron$
);