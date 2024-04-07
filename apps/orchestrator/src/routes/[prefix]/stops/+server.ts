import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params }) => {
  const { client } = locals
  const stops = client.getStops(params.prefix as Prefix)
  return json(stops)
}
