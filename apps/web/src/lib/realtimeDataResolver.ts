import { ClientErrors } from '@lib/client'

type Fetch = typeof fetch

const fetchFromRealtimeApi = async <Type>(prefix: string, httpEndpoint: string, fetch: Fetch) => {
  try {
    const res = await fetch(`/api-rt/${prefix}${httpEndpoint}`)
    if (res.status === 404) return { provider: 'server', error: ClientErrors.NotFound, data: null }
    if (!res.ok) throw `http: ${res.status}`

    const data = (await res.json()) as Type
    return { provider: 'server', data }
  } catch (err) {
    console.error(err)
    return { provider: 'server', error: err }
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
