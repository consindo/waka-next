export const variables = {
  gtfsEndpoint: import.meta.env.VITE_GTFS_ENDPOINT || 'http://localhost:5181',
  gtfsRealtimeEndpoint: import.meta.env.VITE_GTFS_REALTIME_ENDPOINT || 'http://localhost:5182',
}
