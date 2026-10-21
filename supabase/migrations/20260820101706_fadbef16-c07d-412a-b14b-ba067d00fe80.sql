revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

create policy "Geen directe toegang tot rate limit" on public.contact_rate_limit
for select to authenticated using (false);