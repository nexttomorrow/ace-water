-- ============================================
-- ACEWATER :: categories.description 컬럼 추가
-- 서브페이지 헤더의 부제목으로 사용
-- ============================================

alter table public.categories
  add column if not exists description text;

notify pgrst, 'reload schema';
