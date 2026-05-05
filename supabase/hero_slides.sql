-- Hero slides table + storage bucket setup
-- Run this in Supabase SQL editor

-- 1) Table
create table if not exists public.hero_slides (
  id          bigserial primary key,
  eyebrow     text not null default '',
  title       text not null,
  image_path  text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- 2) RLS
alter table public.hero_slides enable row level security;

drop policy if exists "hero_slides public read" on public.hero_slides;
create policy "hero_slides public read"
  on public.hero_slides for select
  using (true);

drop policy if exists "hero_slides admin write" on public.hero_slides;
create policy "hero_slides admin write"
  on public.hero_slides for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 3) Storage bucket (public)
insert into storage.buckets (id, name, public)
values ('hero', 'hero', true)
on conflict (id) do update set public = true;

-- 4) Storage policies
drop policy if exists "hero bucket public read" on storage.objects;
create policy "hero bucket public read"
  on storage.objects for select
  using (bucket_id = 'hero');

drop policy if exists "hero bucket admin insert" on storage.objects;
create policy "hero bucket admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'hero'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "hero bucket admin update" on storage.objects;
create policy "hero bucket admin update"
  on storage.objects for update
  using (
    bucket_id = 'hero'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "hero bucket admin delete" on storage.objects;
create policy "hero bucket admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'hero'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
