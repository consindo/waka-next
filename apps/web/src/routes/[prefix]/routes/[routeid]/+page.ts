import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params }) => {
  const prefix = params.prefix as Prefix
  const routeId = params.routeid

  const data = await resolveData(
    prefix,
    `/routes/${routeId}`,
    (client) => client.getRoute(prefix, routeId),
    fetch
  )

  return data
}
