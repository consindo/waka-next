import { json } from '@sveltejs/kit'

import { ClientErrors, type Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params, url }) => {
  const { client } = locals
  const bounds = url.searchParams.get('bounds') || ''
  const query = url.searchParams.get('q') || ''
  try {
    let stops
    if (bounds !== '') {
      const [minLat, maxLat, minLon, maxLon] = bounds.split(',').map((i) => parseFloat(i))
      stops = client.getStopsByLocation(params.prefix as Prefix, minLat, maxLat, minLon, maxLon)
    } else {
      stops = client.getStops(params.prefix as Prefix, query)
    }
    return json(stops)
  } catch (err) {
    if ((err as App.Error).code === ClientErrors.RegionNotFound) {
      return json({ code: 404, error: ClientErrors.RegionNotFound }, { status: 404 })
    }
    throw err
  }
}
