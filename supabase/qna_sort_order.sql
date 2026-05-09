-- ============================================
-- Q&A 순서 관리: sort_order 컬럼 추가
-- ============================================

alter table public.qna
  add column if not exists sort_order int not null default 0;

create index if not exists qna_sort_idx on public.qna (sort_order, created_at desc);

notify pgrst, 'reload schema';
