import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const { client } = locals
  const routes = client.getRoutes('all')
  return json(routes)
}
