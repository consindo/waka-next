import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, params }) => {
  const prefix = params.prefix as Prefix
  const data = await locals.configManager.checkForUpdate(prefix)
  return json(data)
}
