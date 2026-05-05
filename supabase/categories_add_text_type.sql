-- Allow new display_type 'text' on categories
-- Run this in Supabase SQL editor

alter table public.categories
  drop constraint if exists categories_display_type_check;

alter table public.categories
  add constraint categories_display_type_check
  check (display_type in ('tile', 'link', 'text'));
