import { type RequestHandler } from '@sveltejs/kit'

import { variables } from '#lib/variables.ts'

export const GET: RequestHandler = async ({ fetch }) => {
  const data = await fetch(variables.gtfsEndpoint + '/regions').then((r) => r.json())

  // todo: we will need to get the userlocation somehow...
  return Response.json({ ...data, userLocation: {} })
}
