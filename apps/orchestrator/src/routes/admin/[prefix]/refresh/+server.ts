import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, params }) => {
  const prefix = params.prefix as Prefix
  const version = await locals.configManager.determineLatestVersion(prefix)
  return Response.json({
    latestVersion: { prefix, version },
  })
}
