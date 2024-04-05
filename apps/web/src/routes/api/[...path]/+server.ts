import type { RequestHandler } from '@sveltejs/kit'

import { variables } from '$lib/variables'

// this just proxies the orchestrator
export const GET: RequestHandler = ({ fetch, params }) => {
  return fetch(variables.gtfsEndpoint + '/' + params.path)
}
