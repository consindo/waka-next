import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ locals, params, request }) => {
  const { prefix } = params
  const { realtimeCache } = locals
  const { serviceAlerts } = realtimeCache.getRegion(prefix)
  const { searchParams } = new URL(request.url)
  const routeIds = searchParams.getAll('routeid')
  const stopIds = searchParams.getAll('stopid')
  if (routeIds.length + stopIds.length === 0) {
    return error(400, {
      name: 'missing search params',
      message: 'please include one or many search parameters (routeid, stopid)',
    })
  }
  // todo: feed also supports agency, trip, or routetype
  // just not sure if we need this for our app yet
  const filteredAlerts = serviceAlerts.filter(
    (i) =>
      (i.informedEntity || []).some((j) => (j.routeId ? routeIds.includes(j.routeId) : false)) ||
      (i.informedEntity || []).some((j) => (j.stopId ? stopIds.includes(j.stopId) : false))
  )

  return json({ serviceAlerts: filteredAlerts })
}
