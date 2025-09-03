import type { Prefix } from '@lib/client'

interface MapState {
  currentStop: {
    stopType: string
    coordinates: [number, number]
  }[]
  currentShape: {
    prefix: Prefix
    shapeId: string
  }[]
}

export const mapState = $state<MapState>({
  currentStop: [],
  currentShape: [],
})
