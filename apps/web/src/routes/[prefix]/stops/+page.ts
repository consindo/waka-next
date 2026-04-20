import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params, url }) => {
  const prefixes = params.prefix.split(',') as Prefix[]

  const query = url.searchParams.get('q') || ''
  const stops = await Promise.all(
    prefixes.map((prefix) =>
      resolveData(
        prefix,
        `/stops?q=${encodeURIComponent(query)}`,
        (client) => client.getStops(prefix, query),
        fetch
      )
    )
  )
  return { stops: stops.map((i) => i.data || []).flat() }
}
