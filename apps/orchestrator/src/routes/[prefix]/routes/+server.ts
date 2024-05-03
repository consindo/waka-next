import { json } from '@sveltejs/kit'

import { ClientErrors, type Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params, url }) => {
  const { client } = locals
  const routeType = url.searchParams.get('routeType') || undefined
  try {
    const routes = client.getRoutes(params.prefix as Prefix, routeType)
    return json({ routes })
  } catch (err) {
    if ((err as App.Error).code === ClientErrors.RegionNotFound) {
      return json({ code: 404, error: ClientErrors.RegionNotFound }, { status: 404 })
    }
    throw err
  }
}
