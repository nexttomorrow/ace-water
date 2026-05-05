# board_learn

Next.js (App Router) + Supabase 로 만든 갤러리 + 게시판 + 어드민 풀스택 예제.

## 기능

- **갤러리** — 누구나 보기, 어드민만 CRUD (이미지 업로드/교체/삭제)
- **게시판** — 누구나 보기, 로그인 유저는 본인 글 CRUD, 어드민은 전체 글 CRUD
- **인증** — 이메일 + 비밀번호 회원가입/로그인 (Supabase Auth)
- **권한 분리** — Postgres RLS 로 DB 단에서 보장

## 1. Supabase 프로젝트 만들기

1. https://supabase.com 가입 → New project
2. 프로젝트 생성 후 **Settings → API** 에서 두 값 복사:
   - `Project URL`
   - `anon public` key

## 2. `.env.local` 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 에 위 두 값 붙여넣기:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
```

## 3. DB 스키마 + RLS 정책 적용

Supabase Dashboard → **SQL Editor** → New query → `supabase/schema.sql` 내용 전체 붙여넣고 **Run**.

이 한 번의 실행으로 다음이 만들어집니다:

- `profiles`, `posts`, `gallery_items` 테이블
- 회원가입 시 자동 프로필 생성 트리거
- RLS 정책 (어드민/본인/누구나 권한 분리)
- `gallery` storage 버킷 (public read, admin write)
- `posts.updated_at` 자동 갱신 트리거

## 4. (선택) 이메일 확인 끄기

빠른 테스트를 위해서는 Supabase Dashboard → **Authentication → Providers → Email** 에서
"Confirm email" 을 **OFF** 로 두면 가입 즉시 로그인 가능합니다. (운영 시엔 ON)

## 5. 어드민 계정 만들기

1. 앱에서 `/signup` 으로 일반 회원가입
2. Supabase Dashboard → **Table Editor → profiles** 에서
   해당 사용자의 `role` 컬럼을 `user` → `admin` 으로 수정
3. 다시 로그인하면 상단 네비에 **어드민** 메뉴가 보입니다

## 6. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000

## 라우트 구조

| 경로 | 권한 | 설명 |
|------|------|------|
| `/` | 누구나 | 홈 (갤러리 미리보기 + 최근 게시글) |
| `/login`, `/signup` | 비로그인 | 로그인/회원가입 |
| `/gallery` | 누구나 | 갤러리 보기 |
| `/board` | 누구나 | 게시판 목록 |
| `/board/[id]` | 누구나 | 게시글 상세 |
| `/board/new` | 로그인 유저 | 글쓰기 |
| `/board/[id]/edit` | 작성자 or 어드민 | 글 수정 |
| `/admin` | 어드민 | 대시보드 |
| `/admin/gallery` | 어드민 | 갤러리 CRUD |
| `/admin/board` | 어드민 | 게시판 관리 (모든 글 삭제 가능) |

## 보안 메모

- 권한 검사는 **미들웨어 + RLS 이중**으로 동작합니다.
  - 미들웨어: 라우트 단에서 비로그인/비어드민 차단 (UX)
  - RLS: DB 단에서 권한 위반 차단 (SOT) — 클라이언트가 우회해도 막힘
- `image_path` 는 storage 키만 저장. 실제 URL 은 public 버킷 규칙으로 조립.
- `service_role` 키는 어디에도 두지 않음. anon key 만 사용.
