import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params }) => {
  const prefix = params.prefix as Prefix
  const shapeId = params.shape_id as string
  const data = await resolveData(
    prefix,
    `/shapes/${shapeId}`,
    (client) => client.getShape(prefix, shapeId),
    fetch
  )
  return data
}
