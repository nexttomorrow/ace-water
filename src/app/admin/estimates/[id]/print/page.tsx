import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PrintView from './PrintView'
import {
  ESTIMATE_REQUEST_TYPES,
  ESTIMATE_DELIVERY_METHODS,
  ESTIMATE_EXTRA_OPTIONS,
  type EstimateInquiry,
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
      note={it.note}
      attachmentName={it.attachment_name}
    />
  )
}
