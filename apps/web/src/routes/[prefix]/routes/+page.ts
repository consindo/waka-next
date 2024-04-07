import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params }) => {
  const prefix = params.prefix as Prefix
  const data = resolveData(prefix, `/routes`, (client) => client.getRoutes(prefix), fetch)
  return data
}
