create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can read own roles" on public.user_roles
for select to authenticated using (auth.uid() = user_id);

create table public.contact_berichten (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  email text not null,
  onderwerp text not null,
  bericht text not null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);
grant select, delete on public.contact_berichten to authenticated;
grant all on public.contact_berichten to service_role;
alter table public.contact_berichten enable row level security;

create policy "Admins kunnen contactberichten lezen" on public.contact_berichten
for select to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "Admins kunnen contactberichten verwijderen" on public.contact_berichten
for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.contact_rate_limit (
  ip_hash text primary key,
  window_start timestamptz not null default now(),
  aantal integer not null default 0
);
grant all on public.contact_rate_limit to service_role;
alter table public.contact_rate_limit enable row level security;

create index contact_berichten_created_at_idx on public.contact_berichten (created_at desc);