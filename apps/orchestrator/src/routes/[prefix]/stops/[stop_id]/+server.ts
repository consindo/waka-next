import { ClientErrors, type Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params }) => {
  const { client } = locals

  try {
    const routes = client.getStop(params.prefix as Prefix, params.stop_id)
    return Response.json(routes)
  } catch (err) {
    if ((err as App.Error).code === ClientErrors.RegionNotFound) {
      return Response.json({ code: 404, error: ClientErrors.RegionNotFound }, { status: 404 })
    }
    throw err
  }
}
