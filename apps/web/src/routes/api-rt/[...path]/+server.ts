import type { RequestHandler } from '@sveltejs/kit'

import { variables } from '$lib/variables'

// this just proxies the realtime
export const GET: RequestHandler = ({ fetch, params, url }) => {
  return fetch(variables.gtfsRealtimeEndpoint + '/' + params.path + url.search)
}
