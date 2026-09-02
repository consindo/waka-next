import type { Prefix } from '@lib/client'

interface MapState {
  currentStop: {
    prefix: string
    name: string
    routeType: number | undefined
    coordinates: [number, number]
  }[]
  currentShape: {
    prefix: Prefix
    shapeId: string
    color?: string
  }[]
  vehicleLocations: {
    prefix: Prefix
    coordinates: [number, number]
    routeType: number
    occupancy?: string
    lastUpdated: Date
  }[]
  visibleStops: {
    prefix: Prefix
    stopId: string
    stopName?: string
    coordinates: [number, number]
  }[]
}

export const currentRegions = $state<{
  ids: string[]
}>({ ids: [] })

export const mapState = $state<MapState>({
  currentStop: [],
  currentShape: [],
  vehicleLocations: [],
  visibleStops: [],
})
