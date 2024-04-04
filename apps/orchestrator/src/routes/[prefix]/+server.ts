import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params }) => {
  const { configManager } = locals
  const res = await configManager.getVersions(params.prefix as Prefix)
  return json({ versions: res.versions })
}
