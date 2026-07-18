-- Hero slides: per-slide autoplay duration (표시 시간)
-- Run this in Supabase SQL editor.
-- duration_ms = 해당 슬라이드가 화면에 머무는 시간(ms). 기본 5000ms(5초).

alter table public.hero_slides
  add column if not exists duration_ms int not null default 5000;

-- 안전 범위(2~12초)로 제한 — 어드민 입력값도 서버에서 clamp 하지만 DB 레벨에서도 방어
alter table public.hero_slides
  drop constraint if exists hero_slides_duration_ms_range;
alter table public.hero_slides
  add constraint hero_slides_duration_ms_range
  check (duration_ms between 1000 and 20000);
