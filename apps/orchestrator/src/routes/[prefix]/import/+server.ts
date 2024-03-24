import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params, url }) => {
  // only one access token is supported for now...
  if (url.searchParams.get('access_token') !== env.WAKA_ORCHESTRATOR_ACCESS_TOKEN) {
    return json(
      { status: 'error', prefix: params.prefix, logs: ['403: Unauthorized'] },
      { status: 403 }
    )
  }
  const data = await locals.configManager.checkForUpdate(params.prefix as Prefix)
  return json(data)
}
