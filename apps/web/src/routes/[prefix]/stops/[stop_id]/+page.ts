import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params }) => {
  const prefix = params.prefix as Prefix
  const stopId = params.stop_id

  const data = await resolveData(
    prefix,
    `/stops/${stopId}`,
    (client) => client.getStop(prefix, stopId),
    fetch
  )

  return data
}
