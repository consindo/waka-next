import type { Prefix, RegionResponse } from '@lib/client'

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
  visibleStops: {
    prefix: Prefix
    stopId: string
    stopName?: string
    coordinates: [number, number]
  }[]
}

export const currentCity = $state<{ region: RegionResponse | null, city: RegionResponse['cities'][number] | null }>({
  region: null,
  city: null
})

export const mapState = $state<MapState>({
  currentStop: [],
  currentShape: [],
  visibleStops: [],
})
