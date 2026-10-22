import { PUBLIC_GTFS_ENDPOINT, PUBLIC_GTFS_REALTIME_ENDPOINT } from '$app/env/public'

export const variables = {
  gtfsEndpoint: PUBLIC_GTFS_ENDPOINT || 'http://localhost:5181',
  gtfsRealtimeEndpoint: PUBLIC_GTFS_REALTIME_ENDPOINT || 'http://localhost:5182',
  realtimeMaxDelay: 30 * 60 * 1000, // 30 minutes
  realtimeMaxAdvance: 3 * 60 * 60 * 1000, // 3 hours
  realtimeMaxIds: 200,
  realtimeInvalidationInterval: 10_000, // 10 seconds
  language: 'en', // todo: needs to be configurable
}
