-- Post (board) image storage bucket setup
-- Run this in Supabase SQL editor

-- 1) Bucket (public read)
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do update set public = true;

-- 2) Policies
drop policy if exists "posts bucket public read" on storage.objects;
create policy "posts bucket public read"
  on storage.objects for select
  using (bucket_id = 'posts');

drop policy if exists "posts bucket admin insert" on storage.objects;
create policy "posts bucket admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'posts'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "posts bucket admin update" on storage.objects;
create policy "posts bucket admin update"
  on storage.objects for update
  using (
    bucket_id = 'posts'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "posts bucket admin delete" on storage.objects;
create policy "posts bucket admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'posts'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
