import { json, type RequestHandler } from '@sveltejs/kit'

import { variables } from '$lib/variables'

export const GET: RequestHandler = async ({ fetch, platform }) => {
  const data = await fetch(variables.gtfsEndpoint + '/regions').then(r => r.json())

  const netlifyPlatform = (platform as { context: unknown })

  return json({ ...data, userLocation: netlifyPlatform || {} })
}
