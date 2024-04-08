import { type RequestHandler, json } from '@sveltejs/kit'

import { variables } from '$lib/variables'

type NetlifyContext = {
  geo: {
    latitude: number
    longitude: number
  }
}

export const GET: RequestHandler = async ({ fetch, platform }) => {
  const data = await fetch(variables.gtfsEndpoint + '/regions').then((r) => r.json())

  const netlifyPlatform = platform as { context: NetlifyContext } | undefined

  return json({ ...data, userLocation: netlifyPlatform?.context.geo || {} })
}
