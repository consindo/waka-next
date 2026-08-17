export interface RealtimeCache {
  initialTime: Date | null
  currentTime: Date
}

const cache: RealtimeCache = {
  initialTime: null,
  currentTime: new Date(),
}

const pullRealtimeData = () => {
  cache.currentTime = new Date()
  console.log('cache updated!', cache.currentTime.toISOString())
}

export const startRealtime = () => {
  cache.initialTime = new Date()
  setInterval(pullRealtimeData, 15_000)
  return cache
}
