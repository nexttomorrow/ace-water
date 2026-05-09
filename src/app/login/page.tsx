import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; redirect?: string }>
}) {
  const sp = await searchParams

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-neutral-200 p-6">
      <h1 className="mb-4 text-xl font-semibold">로그인</h1>

      {sp.message && (
        <p className="mb-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{sp.message}</p>
      )}
      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={login} className="flex flex-col gap-3">
        <input type="hidden" name="redirect" value={sp.redirect ?? '/mng'} />
        <label className="flex flex-col text-sm">
          아이디 또는 이메일
          <input
            name="email"
            type="text"
            autoComplete="username"
            required
            placeholder="admin / master / 또는 이메일"
            className="mt-1 rounded border border-neutral-300 px-3 py-2"
          />
          <span className="mt-1 text-[0.75rem] text-neutral-500">
            아이디만 입력하면 내부 도메인(@acewater.local)으로 자동 매핑됩니다.
          </span>
        </label>
        <label className="flex flex-col text-sm">
          비밀번호
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            className="mt-1 rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          로그인
        </button>
      </form>

    </div>
  )
}
