import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteNotice } from "../actions";
import sanitizeHtml from "sanitize-html";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const noticeId = Number(id);
  if (!Number.isFinite(noticeId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 조인은 prod DB 의 FK 관계 추론에 의존해서 실패 케이스가 있음 → 분리 쿼리
  const { data: notice, error: noticeErr } = await supabase
    .from("notices")
    .select("id, title, content, author_id, created_at, updated_at")
    .eq("id", noticeId)
    .maybeSingle();

  if (noticeErr) {
    console.error("[notice detail] fetch failed", noticeErr);
  }
  if (!notice) notFound();

  let authorNickname: string | null = null;
  if (notice.author_id) {
    const { data: authorRow } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", notice.author_id)
      .maybeSingle();
    authorNickname = authorRow?.nickname ?? null;
  }

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  const canModify = isAdmin;

  const handleDelete = deleteNotice.bind(null, noticeId);

  // HTML 정제 (XSS 방지)
  const cleanContent = sanitizeHtml(notice.content ?? "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "span",
      "p",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      td: ["colspan", "rowspan", "colwidth"],
      th: ["colspan", "rowspan", "colwidth"],
    },
  });

  return (
    <article className="mx-auto max-w-[1440px] px-6 py-12">
      <header className="mb-5 border-b border-neutral-200 pb-4">
        <div className="mb-2">
          <span className="inline-flex items-center rounded bg-neutral-900 px-2 py-0.5 text-[0.75rem] font-bold text-white">
            공지
          </span>
        </div>
        <h1 className="text-2xl font-bold">{notice.title}</h1>
        <p className="mt-1 text-xs text-neutral-500">
          {authorNickname ?? "관리자"} ·{" "}
          {new Date(notice.created_at).toLocaleString("ko-KR")}
          {notice.updated_at !== notice.created_at && (
            <> · 수정됨 {new Date(notice.updated_at).toLocaleString("ko-KR")}</>
          )}
        </p>
      </header>

      <div
        className="prose prose-neutral max-w-none [&_table]:border [&_table]:border-collapse [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-neutral-300 [&_td]:px-2 [&_td]:py-1 [&_img]:rounded"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />

      <div className="mt-8 flex gap-2">
        <Link
          href="/notices"
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-100"
        >
          목록
        </Link>
        {canModify && (
          <>
            <Link
              href={`/notices/${notice.id}/edit`}
              className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-100"
            >
              수정
            </Link>
            <form action={handleDelete}>
              <button
                type="submit"
                className="rounded border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                삭제
              </button>
            </form>
          </>
        )}
      </div>
    </article>
  );
}
