import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, params, request }) => {
  const prefix = params.prefix as Prefix
  // only one access token is supported for now...
  if (request.headers.get('Authorization') !== `Bearer ${env.WAKA_ORCHESTRATOR_ACCESS_TOKEN}`) {
    return json(
      { status: 'error', prefix: params.prefix, logs: ['403: Unauthorized'] },
      { status: 403 }
    )
  }
  const data = await locals.configManager.checkForUpdate(prefix)
  return json(data)
}
