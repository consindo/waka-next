import { ClientErrors } from '@lib/client'
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

type Fetch = typeof fetch

const fetchFromRealtimeApi = async <Type>(
  prefix: string,
  httpEndpoint: string,
  fetch: Fetch
): Promise<{ provider: string; data: Type | null; error?: string }> => {
  try {
    const res = await fetch(`/api-rt/${prefix}${httpEndpoint}`)
    if (res.status === 404) return { provider: 'server', error: ClientErrors.NotFound, data: null }
    if (!res.ok) throw `http: ${res.status}`

    const data = (await res.json()) as Type
    return { provider: 'server', data }
  } catch (err) {
    console.error(err)
    throw err
  }
}

interface RealtimeRegionResponse {
  region: string
  lastUpdated: Date | null
  serviceAlertsCount: number
  tripUpdatesCount: number
  vehicleLocationsCount: number
}

export const getRealtimeRegions = async (fetch: Fetch) => {
  return fetchFromRealtimeApi<{ regions: RealtimeRegionResponse[] }>('', 'regions', fetch)
}

export const getRealtimeServiceAlerts = async (
  { prefix, routeIds, stopIds }: { prefix: string; routeIds?: string[]; stopIds?: string[] },
  fetch: Fetch
) => {
  const searchParams = new URLSearchParams()
  ;(routeIds || []).forEach((i) => {
    searchParams.append('routeid', i)
  })
  ;(stopIds || []).forEach((i) => {
    searchParams.append('stopid', i)
  })
  return fetchFromRealtimeApi<{ serviceAlerts: GtfsRealtimeBindings.transit_realtime.IAlert[] }>(
    prefix,
    `/servicealerts?${searchParams.toString()}`,
    fetch
  )
}

export const getRealtimeTripUpdates = async (
  { prefix, routeIds, tripIds }: { prefix: string; routeIds?: string[]; tripIds?: string[] },
  fetch: Fetch
) => {
  const searchParams = new URLSearchParams()
  ;(routeIds || []).forEach((i) => {
    searchParams.append('routeid', i)
  })
  ;(tripIds || []).forEach((i) => {
    searchParams.append('tripid', i)
  })
  return fetchFromRealtimeApi<{
    tripUpdates: GtfsRealtimeBindings.transit_realtime.ITripUpdate[]
  }>(prefix, `/tripupdates?${searchParams.toString()}`, fetch)
}

export const getRealtimeVehicleLocations = async (
  { prefix, routeIds, tripIds }: { prefix: string; routeIds?: string[]; tripIds?: string[] },
  fetch: Fetch
) => {
  const searchParams = new URLSearchParams()
  ;(routeIds || []).forEach((i) => {
    searchParams.append('routeid', i)
  })
  ;(tripIds || []).forEach((i) => {
    searchParams.append('tripid', i)
  })
  return fetchFromRealtimeApi<{
    vehicleLocations: GtfsRealtimeBindings.transit_realtime.IVehiclePosition[]
  }>(prefix, `/vehiclelocations?${searchParams.toString()}`, fetch)
}
