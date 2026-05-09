'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { EstimateStatus } from '@/lib/types'

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
  return { supabase }
}

const STATUS_VALUES = ['new', 'in_progress', 'done', 'archived'] as const

export async function updateEstimateStatus(id: number, formData: FormData) {
  const { supabase } = await ensureAdmin()
  const raw = String(formData.get('status') ?? '')
  if (!STATUS_VALUES.includes(raw as EstimateStatus)) return

  const { error } = await supabase
    .from('estimate_inquiries')
    .update({ status: raw })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/mng/estimates')
  revalidatePath(`/mng/estimates/${id}`)
}

export async function deleteEstimate(id: number) {
  const { supabase } = await ensureAdmin()

  const { data: existing } = await supabase
    .from('estimate_inquiries')
    .select('attachment_path')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('estimate_inquiries').delete().eq('id', id)
  if (error) throw new Error(error.message)

  if (existing?.attachment_path) {
    await supabase.storage.from('estimate-files').remove([existing.attachment_path])
  }

  revalidatePath('/mng/estimates')
  redirect('/mng/estimates')
}
