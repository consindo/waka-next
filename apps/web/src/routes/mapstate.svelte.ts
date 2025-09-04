import type { Prefix } from '@lib/client'

interface MapState {
  currentStop: {
    stopType: string
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

export const mapState = $state<MapState>({
  currentStop: [],
  currentShape: [],
  visibleStops: [],
})
