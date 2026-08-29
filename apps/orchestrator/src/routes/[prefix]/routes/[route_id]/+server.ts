import { json } from '@sveltejs/kit'

import { ClientErrors, type Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params, url }) => {
  const { client } = locals
  const stopId = url.searchParams.get('stopId')

  try {
    const routes = client.getRoute(params.prefix as Prefix, params.route_id, stopId || undefined)
    return json(routes)
  } catch (err) {
    if ((err as App.Error).code === ClientErrors.RegionNotFound) {
      return json({ code: 404, error: ClientErrors.RegionNotFound }, { status: 404 })
    }
    throw err
  }
}
