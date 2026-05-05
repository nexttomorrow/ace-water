import Link from 'next/link'
import { signup } from '../login/actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const sp = await searchParams

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg border border-neutral-200 p-6">
      <h1 className="mb-4 text-xl font-semibold">회원가입</h1>

      {sp.error && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{sp.error}</p>
      )}

      <form action={signup} className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          닉네임
          <input
            name="nickname"
            type="text"
            className="mt-1 rounded border border-neutral-300 px-3 py-2"
          />
        </label>
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
          비밀번호 (6자 이상)
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
          가입하기
        </button>
      </form>

      <p className="mt-4 text-sm text-neutral-600">
        이미 계정이 있으세요?{' '}
        <Link href="/login" className="text-blue-600 underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
