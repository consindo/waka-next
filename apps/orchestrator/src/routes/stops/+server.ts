import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const { client } = locals
  const stops = client.getStops('all')
  return json(stops)
}
