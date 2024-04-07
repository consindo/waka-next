import { getRegions } from '$lib/storage'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
  const regions = await getRegions(fetch)
  return { regions }
}
