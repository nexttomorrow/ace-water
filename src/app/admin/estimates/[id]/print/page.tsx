import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PrintView from './PrintView'
import {
  ESTIMATE_REQUEST_TYPES,
  ESTIMATE_DELIVERY_METHODS,
  ESTIMATE_EXTRA_OPTIONS,
  type EstimateInquiry,
  type ProductColor,
} from '@/lib/types'

export const revalidate = 0

const REQUEST_LABEL = new Map<string, string>(
  ESTIMATE_REQUEST_TYPES.map((r) => [r.value, r.label])
)
const DELIVERY_LABEL = new Map<string, string>(
  ESTIMATE_DELIVERY_METHODS.map((d) => [d.value, d.label])
)
const EXTRA_LABEL = new Map<string, string>(
  ESTIMATE_EXTRA_OPTIONS.map((e) => [e.value, e.label])
)

export default async function EstimatePrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const inquiryId = Number(id)
  if (!Number.isFinite(inquiryId)) notFound()

  const supabase = await createClient()
  const { data } = await supabase
    .from('estimate_inquiries')
    .select('*')
    .eq('id', inquiryId)
    .single()
  if (!data) notFound()

  const it = data as EstimateInquiry

  const requestLabels = (it.request_types ?? []).map(
    (v) => REQUEST_LABEL.get(v) ?? v
  )
  const deliveryLabel = DELIVERY_LABEL.get(it.delivery_method) ?? it.delivery_method
  const extraLabels = (it.extra_options ?? []).map(
    (v) => EXTRA_LABEL.get(v) ?? v
  )

  // model_name 의 각 줄(예: "AW-2000S 정수기") 을 활성 제품과 매칭해서 색상을 끌어옴
  const modelLines = (it.model_name ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const productColorRows: { line: string; colors: ProductColor[] }[] = []
  if (modelLines.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('name, model_name, colors')
      .eq('is_active', true)

    type ProductRow = { name: string; model_name: string | null; colors: ProductColor[] | null }
    const list = ((products ?? []) as ProductRow[]).map((p) => ({
      ...p,
      tokens: [
        p.model_name ? `${p.model_name} ${p.name}` : null,
        p.model_name,
        p.name,
      ]
        .filter((v): v is string => !!v && v.trim().length > 0)
        .map((v) => v.toLowerCase()),
    }))

    for (const line of modelLines) {
      const lc = line.toLowerCase()
      const match = list.find((p) => p.tokens.some((t) => t === lc || lc.includes(t)))
      const colors = (match?.colors ?? []).filter((c) => c?.name && c?.hex)
      if (colors.length > 0) productColorRows.push({ line, colors })
    }
  }

  return (
    <PrintView
      id={it.id}
      createdAt={it.created_at}
      requestLabels={requestLabels}
      companyName={it.company_name ?? it.client_name}
      clientName={it.client_name}
      budget={it.budget}
      contactName={it.contact_name}
      phone={it.phone}
      email={it.email}
      deliveryLabel={deliveryLabel}
      siteAddress={it.site_address}
      dueDate={it.due_date}
      modelName={it.model_name}
      quantity={it.quantity}
      extraLabels={extraLabels}
      productColorRows={productColorRows}
      note={it.note}
      attachmentName={it.attachment_name}
    />
  )
}
