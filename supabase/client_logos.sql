-- 고객사 로고(메인 하단 마퀴) 테이블 + 사이트 설정(섹션 on/off) + 스토리지 버킷
-- Supabase SQL editor 에서 실행

-- ─────────────────────────────────────────────
-- 1) 사이트 설정 (key/value) — 섹션 활성화 등 단순 토글 저장용 (재사용 가능)
-- ─────────────────────────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write"
  on public.site_settings for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 고객사 섹션 기본값: 활성(true)
insert into public.site_settings (key, value)
values ('clients_section_enabled', 'true')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────
-- 2) 고객사 로고 테이블
-- ─────────────────────────────────────────────
create table if not exists public.client_logos (
  id          bigserial primary key,
  name        text not null default '',
  image_path  text not null,
  link_url    text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 노출 조회(활성 + 정렬) 가속
create index if not exists client_logos_active_order_idx
  on public.client_logos (is_active, sort_order, id);

alter table public.client_logos enable row level security;

drop policy if exists "client_logos public read" on public.client_logos;
create policy "client_logos public read"
  on public.client_logos for select
  using (true);

drop policy if exists "client_logos admin write" on public.client_logos;
create policy "client_logos admin write"
  on public.client_logos for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────
-- 3) 스토리지 버킷 (public)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('clients', 'clients', true)
on conflict (id) do update set public = true;

drop policy if exists "clients bucket public read" on storage.objects;
create policy "clients bucket public read"
  on storage.objects for select
  using (bucket_id = 'clients');

drop policy if exists "clients bucket admin insert" on storage.objects;
create policy "clients bucket admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'clients'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "clients bucket admin update" on storage.objects;
create policy "clients bucket admin update"
  on storage.objects for update
  using (
    bucket_id = 'clients'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "clients bucket admin delete" on storage.objects;
create policy "clients bucket admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'clients'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
