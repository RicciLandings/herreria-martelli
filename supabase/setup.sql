-- Ejecutar una sola vez en Supabase → SQL Editor.

-- 1) Quiénes pueden administrar (cambiar el email por el de tu amigo)
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;
insert into public.admins (email) values ('EMAIL_DEL_ADMIN@ejemplo.com')
  on conflict do nothing;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = auth.jwt() ->> 'email');
$$;

-- 2) Trabajos de la galería
create table if not exists public.trabajos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  detalle text,
  foto_path text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.trabajos enable row level security;

create policy "ver trabajos" on public.trabajos for select using (true);
create policy "admin crea"   on public.trabajos for insert to authenticated with check (public.es_admin());
create policy "admin edita"  on public.trabajos for update to authenticated using (public.es_admin());
create policy "admin borra"  on public.trabajos for delete to authenticated using (public.es_admin());

-- 3) Carpeta pública de fotos
insert into storage.buckets (id, name, public) values ('trabajos', 'trabajos', true)
  on conflict (id) do nothing;

create policy "admin sube fotos"  on storage.objects for insert to authenticated
  with check (bucket_id = 'trabajos' and public.es_admin());
create policy "admin borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'trabajos' and public.es_admin());
