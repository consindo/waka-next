import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

interface RegionResponse {
  region: string
  lastUpdated: Date | null
  serviceAlertsCount: number
  tripUpdatesCount: number
  vehicleLocationsCount: number
}

/**
 * Returns all the regions with how much data is in the cache
 */
export const GET: RequestHandler = ({ locals }) => {
  const { configManager, realtimeCache } = locals
  const regions: RegionResponse[] = Object.keys(configManager.getRegions()).map((id) => {
    const cache = realtimeCache.regions[id] || {
      serviceAlerts: [],
      tripUpdates: [],
      vehicleLocations: [],
    }
    const { lastUpdated, serviceAlerts, tripUpdates, vehicleLocations } = cache
    return {
      region: id,
      lastUpdated: lastUpdated || null,
      serviceAlertsCount: serviceAlerts.length,
      tripUpdatesCount: tripUpdates.length,
      vehicleLocationsCount: vehicleLocations.length,
    }
  })
  return json({ regions })
}
