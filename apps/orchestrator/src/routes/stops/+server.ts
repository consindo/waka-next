import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const { client } = locals
  const routes = client.getStops('all')
  return json(routes)
}
