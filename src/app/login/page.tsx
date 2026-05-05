import Link from 'next/link'
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
        <input type="hidden" name="redirect" value={sp.redirect ?? '/'} />
        <label className="flex flex-col text-sm">
          이메일
          <input
            name="email"
            type="email"
            required
            className="mt-1 rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm">
          비밀번호
          <input
            name="password"
            type="password"
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

      <p className="mt-4 text-sm text-neutral-600">
        계정이 없으세요?{' '}
        <Link href="/signup" className="text-blue-600 underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}
