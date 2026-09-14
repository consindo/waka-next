import { type RequestHandler, json } from '@sveltejs/kit'

import { variables } from '$lib/variables'

export const GET: RequestHandler = async ({ fetch }) => {
  const data = await fetch(variables.gtfsEndpoint + '/regions').then((r) => r.json())

  // todo: we will need to get the userlocation somehow...
  return json({ ...data, userLocation: {} })
}
