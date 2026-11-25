-- Ejecutar una sola vez en Supabase → SQL Editor.

-- 1) Quiénes pueden administrar (cambiar el email por el del admin)
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;
insert into public.admins (email) values ('EMAIL_DEL_ADMIN@ejemplo.com')
  on conflict do nothing;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = auth.jwt() ->> 'email');
$$;

-- 2) Configuración de la página (textos, colores, tipografía, orden, etc.) en un solo JSON
create table if not exists public.site_config (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_config enable row level security;
create policy "ver config"   on public.site_config for select using (true);
create policy "admin crea config"  on public.site_config for insert to authenticated with check (public.es_admin());
create policy "admin edita config" on public.site_config for update to authenticated using (public.es_admin());

-- 3) Categorías de trabajos y sus fotos
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  orden int not null default 0,
  portada_path text,
  encuadre text not null default 'center',
  created_at timestamptz not null default now()
);
create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias(id) on delete cascade,
  parent_id uuid references public.fotos(id) on delete cascade, -- si tiene valor, es un detalle de esa foto
  path text not null,
  orden int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists fotos_categoria_idx on public.fotos(categoria_id);
create index if not exists fotos_parent_idx on public.fotos(parent_id);
alter table public.categorias enable row level security;
alter table public.fotos enable row level security;

create policy "ver categorias"  on public.categorias for select using (true);
create policy "admin categorias insert" on public.categorias for insert to authenticated with check (public.es_admin());
create policy "admin categorias update" on public.categorias for update to authenticated using (public.es_admin());
create policy "admin categorias delete" on public.categorias for delete to authenticated using (public.es_admin());
create policy "ver fotos"  on public.fotos for select using (true);
create policy "admin fotos insert" on public.fotos for insert to authenticated with check (public.es_admin());
create policy "admin fotos update" on public.fotos for update to authenticated using (public.es_admin());
create policy "admin fotos delete" on public.fotos for delete to authenticated using (public.es_admin());

-- 4) Carpeta pública de fotos
insert into storage.buckets (id, name, public) values ('trabajos', 'trabajos', true)
  on conflict (id) do nothing;
create policy "admin sube fotos"  on storage.objects for insert to authenticated
  with check (bucket_id = 'trabajos' and public.es_admin());
create policy "admin borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'trabajos' and public.es_admin());
