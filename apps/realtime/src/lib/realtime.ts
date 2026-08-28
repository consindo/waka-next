import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { logger } from '@lib/logger'

import type { RealtimeRegionConfig } from '$lib/configManager'

export interface RealtimeCache {
  regions: Record<string, RegionalRealtimeCache>
  getRegion: (id: string) => RegionalRealtimeCache
}

interface RegionalRealtimeCache {
  lastUpdated: Date
  serviceAlerts: GtfsRealtimeBindings.transit_realtime.IAlert[]
  tripUpdates: GtfsRealtimeBindings.transit_realtime.ITripUpdate[]
  vehicleLocations: GtfsRealtimeBindings.transit_realtime.IVehiclePosition[]
}

const cache: RealtimeCache = {
  regions: {},
  getRegion: function (id: string) {
    const region = this.regions[id] || {
      serviceAlerts: [],
      tripUpdates: [],
      vehicleLocations: [],
    }
    return region
  },
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

  const serviceAlerts = new Map<string, GtfsRealtimeBindings.transit_realtime.IAlert>()
  const tripUpdates = new Map<string, GtfsRealtimeBindings.transit_realtime.ITripUpdate>()
  const vehicleLocations = new Map<string, GtfsRealtimeBindings.transit_realtime.IVehiclePosition>()
  gtfsRtUpdates.forEach((i) => {
    if (i.alert) {
      serviceAlerts.set(i.id, i.alert)
    }
    if (i.tripUpdate) {
      tripUpdates.set(i.id, i.tripUpdate)
    }
    if (i.vehicle) {
      vehicleLocations.set(i.id, i.vehicle)
    }
  })
  cache.regions[regionId] = {
    lastUpdated: new Date(),
    serviceAlerts: Array.from(serviceAlerts.values()),
    tripUpdates: Array.from(tripUpdates.values()),
    vehicleLocations: Array.from(vehicleLocations.values()),
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
