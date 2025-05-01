import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params }) => {
  const prefix = params.prefix as Prefix
  const routeId = params.routeid

  const route = await resolveData(
    prefix,
    `/routes/${routeId}`,
    (client) => client.getRoute(prefix, routeId),
    fetch
  )

  return { route: route.data?.route, services: route.data?.services }
}
