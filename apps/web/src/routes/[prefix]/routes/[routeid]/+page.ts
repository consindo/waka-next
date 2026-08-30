import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'
import {
  getRealtimeServiceAlerts,
  getRealtimeTripUpdates,
  getRealtimeVehicleLocations,
} from '$lib/realtimeDataResolver'
import { variables } from '$lib/variables'

const { realtimeMaxDelay, realtimeMaxAdvance } = variables

export const load: PageLoad = async ({ fetch, params, url, depends }) => {
  depends('route:timetable')
  const prefix = params.prefix as Prefix
  const routeId = params.routeid
  const tripId = url.searchParams.get('tripId')
  const stopId = url.searchParams.get('stopId') || undefined

  const [route, trip] = await Promise.all([
    resolveData(
      prefix,
      `/routes/${routeId}${stopId ? `?stopId=${encodeURIComponent(stopId)}` : ''}`,
      (client) => client.getRoute(prefix, routeId, stopId),
      fetch
    ),
    tripId
      ? resolveData(
          prefix,
          `/trips/${tripId}`,
          (client) => client.getTimetable(prefix, tripId),
          fetch
        )
      : null,
  ])

  const now = new Date().getTime()
  const tripIds =
    route.data?.services
      .filter((i) => {
        if (!i.departureTime) return false
        const departureTime = new Date(i.departureTime).getTime()
        return departureTime > now - realtimeMaxDelay && departureTime < now + realtimeMaxAdvance
      })
      .map((i) => i.tripId) || []
  if (tripId && !tripIds?.includes(tripId)) tripIds.unshift(tripId)

  const serviceAlerts = getRealtimeServiceAlerts({ prefix, routeIds: [routeId] }, fetch)
  const tripUpdates = getRealtimeTripUpdates({ prefix, tripIds }, fetch)
  const vehicleLocations = getRealtimeVehicleLocations({ prefix, tripIds }, fetch)

  return {
    route: route.data?.route,
    services: route.data?.services,
    timetable: trip?.data?.timetable || [],
    serviceAlerts,
    tripUpdates,
    vehicleLocations,
  }
}
