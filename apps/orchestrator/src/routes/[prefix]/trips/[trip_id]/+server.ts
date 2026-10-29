import { ClientErrors, type Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params }) => {
  const { client } = locals

  try {
    const { timetable } = client.getTimetable(params.prefix as Prefix, params.trip_id)
    return Response.json({ timetable })
  } catch (err) {
    if ((err as App.Error).code === ClientErrors.RegionNotFound) {
      return Response.json({ code: 404, error: ClientErrors.RegionNotFound }, { status: 404 })
    }
    throw err
  }
}
