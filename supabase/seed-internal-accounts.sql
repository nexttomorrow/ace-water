-- ============================================================
-- ACEWATER :: 내부 어드민 계정 시드
-- ============================================================
-- Supabase Dashboard > SQL Editor 에서 한 번 실행하세요.
-- 두 계정을 생성합니다:
--   1) admin  / Acewater!23   (최고 관리자)
--   2) master / Acewater!23   (마스터)
--
-- 로그인은 다음과 같이 가능합니다:
--   - "admin" + 비번  → 자동으로 admin@acewater.local 매핑
--   - "master" + 비번 → 자동으로 master@acewater.local 매핑
--
-- 안전 처리:
--   - 같은 이메일이 이미 있으면 비번을 갱신하고 role 만 admin 으로 보장
--   - profiles 트리거가 자동으로 행을 만들어 줌 (handle_new_user)
-- ============================================================

create extension if not exists pgcrypto;

do $$
declare
  rec record;
  user_record record;
  uid uuid;
  accounts jsonb := jsonb_build_array(
    jsonb_build_object('email', 'admin@acewater.local',  'nickname', 'admin',  'password', 'Acewater!23'),
    jsonb_build_object('email', 'master@acewater.local', 'nickname', 'master', 'password', 'Acewater!23')
  );
begin
  for rec in
    select
      a->>'email'    as email,
      a->>'nickname' as nickname,
      a->>'password' as password
    from jsonb_array_elements(accounts) a
  loop
    -- 이미 존재하면 비밀번호 + 메타만 업데이트
    select id into uid from auth.users where email = rec.email;

    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users (
        id, instance_id, aud, role,
        email, encrypted_password, email_confirmed_at,
        raw_user_meta_data, raw_app_meta_data,
        created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) values (
        uid,
        '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        rec.email,
        crypt(rec.password, gen_salt('bf')),
        now(),
        jsonb_build_object('nickname', rec.nickname),
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        now(), now(),
        '', '', '', ''
      );
      raise notice '+ created %', rec.email;
    else
      update auth.users
      set encrypted_password = crypt(rec.password, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          raw_user_meta_data =
            coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('nickname', rec.nickname),
          updated_at = now()
      where id = uid;
      raise notice '~ updated %', rec.email;
    end if;

    -- 트리거가 행을 못 만든 경우(레이스 등) 대비해서 upsert
    insert into public.profiles (id, nickname, role)
    values (uid, rec.nickname, 'admin')
    on conflict (id) do update
      set nickname = excluded.nickname,
          role     = 'admin';
  end loop;
end $$;

-- ============================================================
-- 확인
-- ============================================================
select u.email, p.nickname, p.role
from auth.users u
join public.profiles p on p.id = u.id
where u.email in ('admin@acewater.local', 'master@acewater.local');

notify pgrst, 'reload schema';
