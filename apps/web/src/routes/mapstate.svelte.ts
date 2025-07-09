interface MapState {
  currentStop: {
    stopType: string
    coordinates: [number, number]
  }[]
}

export const mapState = $state<MapState>({
  currentStop: [],
})
