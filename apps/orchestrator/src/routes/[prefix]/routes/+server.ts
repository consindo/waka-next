import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params }) => {
  const { client } = locals
  const routes = client.getRoutes(params.prefix as Prefix)
  return json(routes)
}
