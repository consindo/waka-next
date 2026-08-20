import { logger } from '@lib/logger'

import type { RealtimeRegionConfig } from '$lib/configManager'

export interface RealtimeCache {
  regions: Record<string, RegionalRealtimeCache>
}

interface RegionalRealtimeCache {
  lastUpdated: Date
  serviceAlerts: unknown
  tripUpdates: unknown
  vehicleLocations: unknown
}

const cache: RealtimeCache = {
  regions: {},
}

const getData = async <Type>(url?: string, headers?: Record<string, string>) => {
  if (!url) return {} as Type
  const res = await fetch(url, {
    headers: headers,
  })
  if (!res.ok) {
    logger.info(`received http ${res.status} from upstream`)
    throw new Error(`http: ${res.status}`)
  }
  // todo: will need to support protobuf
  const data = await res.json()
  return data as Type
}

const pullRealtimeData = (regionId: string, region: RealtimeRegionConfig) => async () => {
  const [serviceAlerts, tripUpdates, vehicleLocations] = await Promise.all([
    getData(region.gtfsRtServiceAlertsUrl, region.gtfsRtHeaders),
    getData(region.gtfsRtTripUpdatesUrl, region.gtfsRtHeaders),
    getData(region.gtfsRtVehicleLocationsUrl, region.gtfsRtHeaders),
  ])
  cache.regions[regionId] = {
    lastUpdated: new Date(),
    serviceAlerts,
    tripUpdates,
    vehicleLocations,
  }
  logger.info('rt update ' + regionId)
}

export const startRealtime = (regions: (RealtimeRegionConfig & { id: string })[]) => {
  regions.forEach((region) => {
    setInterval(pullRealtimeData(region.id, region), region.pullInterval || 15_000)
  })
  return cache
}
