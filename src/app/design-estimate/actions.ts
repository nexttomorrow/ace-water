'use server'

import { submitEstimate } from '@/lib/estimates/submit'

/**
 * 실행견적 문의 (이미지 명세 기준 — URL: /design-estimate)
 */
export async function submitDesignEstimate(formData: FormData) {
  await submitEstimate(
    {
      formType: 'design-estimate',
      required: [
        'client_name',
        'contact_name',
        'phone',
        'email',
        'delivery_method',
        'site_address',
        'due_date',
        'model_name',
        'quantity',
      ],
      successUrl: '/design-estimate?submitted=1',
      errorUrlPrefix: '/design-estimate?error=',
      requestTypeDefaults: ['design-estimate'],
    },
    formData
  )
}
