import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params, url }) => {
  const prefix = params.prefix as Prefix
  const routeId = params.routeid
  const tripId = url.searchParams.get('tripId')

  const [route, trip] = await Promise.all([
    resolveData(prefix, `/routes/${routeId}`, (client) => client.getRoute(prefix, routeId), fetch),
    tripId
      ? resolveData(
          prefix,
          `/trips/${tripId}`,
          (client) => client.getTimetable(prefix, tripId),
          fetch
        )
      : null,
  ])

  return {
    route: route.data?.route,
    services: route.data?.services,
    timetable: trip?.data?.timetable || [],
  }
}
