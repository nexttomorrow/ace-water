'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TagScope, TagTone } from '@/lib/types'
import { TAG_TONES } from '@/lib/types'

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/')
  return { supabase, user }
}

const VALID_SCOPES: TagScope[] = ['product', 'qna']

function parseTagFields(formData: FormData) {
  const scopeRaw = String(formData.get('scope') ?? '').trim()
  const scope = (VALID_SCOPES.includes(scopeRaw as TagScope) ? scopeRaw : 'product') as TagScope
  const value = String(formData.get('value') ?? '').trim()
  const label = String(formData.get('label') ?? '').trim()
  const toneRaw = String(formData.get('tone') ?? 'neutral').trim()
  const tone = (TAG_TONES.includes(toneRaw as TagTone) ? toneRaw : 'neutral') as TagTone
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0
  const isActive = formData.get('is_active') === 'on'

  return { scope, value, label, tone, sort_order: sortOrder, is_active: isActive }
}

export async function createTag(formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseTagFields(formData)

  if (!fields.value || !fields.label) {
    redirect('/mng/tags/new?error=' + encodeURIComponent('value 와 label 은 필수입니다'))
  }

  const { error } = await supabase.from('tags').insert(fields)
  if (error) {
    redirect('/mng/tags/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/mng/tags')
  revalidatePath('/qna')
  redirect('/mng/tags?scope=' + encodeURIComponent(fields.scope))
}

export async function updateTag(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()
  const fields = parseTagFields(formData)

  if (!fields.value || !fields.label) {
    redirect(`/mng/tags/${id}/edit?error=` + encodeURIComponent('value 와 label 은 필수입니다'))
  }

  const { error } = await supabase.from('tags').update(fields).eq('id', id)
  if (error) {
    redirect(`/mng/tags/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  revalidatePath('/mng/tags')
  revalidatePath('/qna')
  redirect('/mng/tags?scope=' + encodeURIComponent(fields.scope))
}

export async function deleteTag(id: number) {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/mng/tags')
  revalidatePath('/qna')
}
