import type { RegionResponse } from '@lib/client'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
  const regions: { regions: RegionResponse[] } = await fetch('/api/regions').then((r) => r.json())
  return regions
}
