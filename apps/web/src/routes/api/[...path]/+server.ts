import type { RequestHandler } from '@sveltejs/kit'

import { variables } from '$lib/variables'

// this just proxies the orchestrator
export const GET: RequestHandler = ({ fetch, params, url }) => {
  return fetch(variables.gtfsEndpoint + '/' + params.path + url.search)
}

export const POST: RequestHandler = async ({ fetch, params, request }) => {
  const body = await request.json()
  return fetch(variables.gtfsEndpoint + '/' + params.path, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(body),
  })
}
