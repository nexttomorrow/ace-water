-- 고객사 로고 이름(타이틀) 백필 — 이름이 비어있는 기존 로고에 임시 이름 부여
-- (이름이 이제 필수값이라, 과거에 이름 없이 등록된 행을 채워줍니다)
-- Supabase SQL editor 에서 1회 실행. 이후 어드민 "수정"에서 실제 회사명으로 바꾸면 됩니다.

with numbered as (
  select
    id,
    row_number() over (order by sort_order, id) as rn
  from public.client_logos
  where coalesce(trim(name), '') = ''
)
update public.client_logos c
set name = '고객사 ' || n.rn
from numbered n
where c.id = n.id;
