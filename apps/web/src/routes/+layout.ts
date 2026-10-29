import { getRegions } from '#lib/storage.ts'

import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch }) => {
  const regions = await getRegions(fetch)
  return { regions }
}
