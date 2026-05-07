-- ============================================
-- ACEWATER :: gallery_items.category_id FK 정리
-- 시공사례 카테고리를 별도 테이블(construction_case_categories)이 아닌
-- 메인 categories 의 "제품안내" 하위 항목으로 변경했기 때문에,
-- 기존 FK가 있다면 제거합니다. (categories 와 새로 FK 를 묶진 않습니다 — 단순 number 로 사용)
-- ============================================

alter table public.gallery_items
  drop constraint if exists gallery_items_category_id_fkey;

notify pgrst, 'reload schema';
