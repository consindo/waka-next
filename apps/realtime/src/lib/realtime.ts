import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
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

const getData = async (url?: string, headers?: Record<string, string>) => {
  if (!url) return []
  const res = await fetch(url, {
    headers: {
      Accept: 'application/x-protobuf',
      ...(headers || {}),
    },
  })
  if (!res.ok) {
    logger.info(`received http ${res.status} from upstream`)
    throw new Error(`http: ${res.status}`)
  }
  const buffer = await res.arrayBuffer()
  const data = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer))
  return data.entity
}

const pullRealtimeData = (regionId: string, region: RealtimeRegionConfig) => async () => {
  const timeStart = new Date().getTime()
  const gtfsRtUpdates = (
    await Promise.all([
      getData(region.gtfsRtServiceAlertsUrl, region.gtfsRtHeaders),
      getData(region.gtfsRtTripUpdatesUrl, region.gtfsRtHeaders),
      getData(region.gtfsRtVehicleLocationsUrl, region.gtfsRtHeaders),
    ])
  ).flat()

  const serviceAlerts: GtfsRealtimeBindings.transit_realtime.IAlert[] = []
  const tripUpdates: GtfsRealtimeBindings.transit_realtime.ITripUpdate[] = []
  const vehicleLocations: GtfsRealtimeBindings.transit_realtime.IVehiclePosition[] = []
  gtfsRtUpdates.forEach((i) => {
    if (i.alert) {
      serviceAlerts.push(i.alert)
    }
    if (i.tripUpdate) {
      tripUpdates.push(i.tripUpdate)
    }
    if (i.vehicle) {
      vehicleLocations.push(i.vehicle)
    }
  })
  cache.regions[regionId] = {
    lastUpdated: new Date(),
    serviceAlerts,
    tripUpdates,
    vehicleLocations,
  }
  const elapsedTime = new Date().getTime() - timeStart
  logger.info(`${regionId} rt update (${elapsedTime}ms)`)
}

export const startRealtime = (regions: (RealtimeRegionConfig & { id: string })[]) => {
  regions.forEach((region) => {
    setInterval(pullRealtimeData(region.id, region), region.pullInterval || 15_000)
  })
  return cache
}
