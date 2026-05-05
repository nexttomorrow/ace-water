import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rid = Number(id)
  if (!Number.isFinite(rid)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('resources')
    .select('file_path, file_name')
    .eq('id', rid)
    .single()

  if (!data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  await supabase.rpc('increment_resource_download', { rid })

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const fileName = encodeURIComponent(data.file_name)
  const url = `${base}/storage/v1/object/public/resources/${data.file_path}?download=${fileName}`

  return NextResponse.redirect(url)
}
