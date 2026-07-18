import SubPageBanner from '@/components/SubPageBanner'
import CompanyIntro from './CompanyIntro'
import { createClient } from '@/lib/supabase/server'
import type { Certification } from '@/lib/types'

export const revalidate = 0

export default async function CompanyPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('certifications')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  const certifications = (data ?? []) as Certification[]

  return (
    <>
      <SubPageBanner href="/about" />
      <CompanyIntro certifications={certifications} />
    </>
  )
}
