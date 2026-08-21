import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ locals, params, request }) => {
  const { prefix } = params
  const { realtimeCache } = locals
  const { tripUpdates } = realtimeCache.getRegion(prefix)
  const { searchParams } = new URL(request.url)
  const routeIds = searchParams.getAll('routeid')
  const tripIds = searchParams.getAll('tripid')
  if (routeIds.length + tripIds.length === 0) {
    return error(400, {
      name: 'missing search params',
      message: 'please include one or many search parameters (routeid, tripid)',
    })
  }
  const filteredTrips = tripUpdates.filter(
    (i) => routeIds.includes(i.trip?.routeId || '') || tripIds.includes(i.trip?.tripId || '')
  )
  return json({ tripUpdates: filteredTrips })
}
