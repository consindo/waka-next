import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params, url }) => {
  const prefix = params.prefix as Prefix
  const query = url.searchParams.get('q') || ''
  const stops = await resolveData(
    prefix,
    `/stops?q=${encodeURIComponent(query)}`,
    (client) => client.getStops(prefix, query),
    fetch
  )
  return { stops: stops.data || [] }
}
