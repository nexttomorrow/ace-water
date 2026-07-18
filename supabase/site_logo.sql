-- 사이트 로고(헤더) — 이미지 저장용 storage 버킷 + 기본 텍스트 설정
-- 선행: supabase/client_logos.sql (site_settings 테이블 생성) 을 먼저 실행해야 함
-- Supabase SQL editor 에서 실행

-- 1) 기본 로고 텍스트 (이미지가 없을 때 폴백으로 노출)
insert into public.site_settings (key, value)
values ('logo_text', 'ACEWATER')
on conflict (key) do nothing;

-- 2) 사이트 공통 자산(로고 등) 버킷 (public)
insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do update set public = true;

drop policy if exists "site bucket public read" on storage.objects;
create policy "site bucket public read"
  on storage.objects for select
  using (bucket_id = 'site');

drop policy if exists "site bucket admin insert" on storage.objects;
create policy "site bucket admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'site'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "site bucket admin update" on storage.objects;
create policy "site bucket admin update"
  on storage.objects for update
  using (
    bucket_id = 'site'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "site bucket admin delete" on storage.objects;
create policy "site bucket admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'site'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
