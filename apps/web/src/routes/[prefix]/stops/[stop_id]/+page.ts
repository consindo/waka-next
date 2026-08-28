import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'
import { getRealtimeServiceAlerts, getRealtimeTripUpdates } from '$lib/realtimeDataResolver'

import type { PageLoad } from './$types'
import { variables } from '$lib/variables'

const { realtimeMaxDelay, realtimeMaxAdvance } = variables

export const load: PageLoad = async ({ fetch, params }) => {
  const prefix = params.prefix as Prefix
  const stopId = params.stop_id

  const data = await resolveData(
    prefix,
    `/stops/${stopId}`,
    (client) => client.getStop(prefix, stopId),
    fetch
  )

  const now = new Date().getTime()
  const tripIds =
    data.data?.stopTimes
      .filter((i) => {
        if (!i.departureTime) return false
        const departureTime = new Date(i.departureTime).getTime()
        return departureTime > now - realtimeMaxDelay && departureTime < now + realtimeMaxAdvance
      })
      .map((i) => i.tripId) || []
  const serviceAlerts = getRealtimeServiceAlerts({ prefix, stopIds: [stopId] }, fetch)
  const tripUpdates = getRealtimeTripUpdates({ prefix, tripIds }, fetch)

  return { ...data, serviceAlerts, tripUpdates }
}
