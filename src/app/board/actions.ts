"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@/lib/supabase/server";

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { supabase, user, isAdmin: profile?.role === "admin" };
}

function sanitize(html: string) {
  return sanitizeHtml(html, {
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
}

const POSTS_BUCKET = "posts";

export async function uploadPostImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const { supabase, isAdmin } = await ensureAdmin();
  if (!isAdmin) return { error: "권한이 없습니다." };

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { error: "이미지를 선택해주세요." };
  if (!file.type.startsWith("image/"))
    return { error: "이미지 파일만 업로드 가능합니다." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(POSTS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${POSTS_BUCKET}/${path}`;
  return { url };
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/board/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/board");

  const title = String(formData.get("title") ?? "").trim();
  const rawContent = String(formData.get("content") ?? "").trim();
  const content = sanitize(rawContent);

  if (!title || !content || content === "<p></p>") {
    redirect(
      "/board/new?error=" + encodeURIComponent("제목과 내용을 입력해주세요"),
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ title, content, author_id: user.id })
    .select("id")
    .single();

  if (error) {
    redirect("/board/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/board");
  revalidatePath("/");
  redirect(`/board/${data!.id}`);
}

export async function updatePost(id: number, formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  const rawContent = String(formData.get("content") ?? "").trim();
  const content = sanitize(rawContent);

  if (!title || !content || content === "<p></p>") {
    redirect(
      `/board/${id}/edit?error=` +
        encodeURIComponent("제목과 내용을 입력해주세요"),
    );
  }

  // RLS will reject if not author or admin
  const { error } = await supabase
    .from("posts")
    .update({ title, content })
    .eq("id", id);

  if (error) {
    redirect(`/board/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/board");
  revalidatePath(`/board/${id}`);
  redirect(`/board/${id}`);
}

export async function deletePost(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    // can't easily redirect with query for arbitrary path; throw
    throw new Error(error.message);
  }

  revalidatePath("/board");
  revalidatePath("/");
  redirect("/board");
}
