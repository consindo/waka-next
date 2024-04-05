import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params }) => {
  const { configManager } = locals
  const prefix = params.prefix as Prefix
  const config = configManager.getConfiguredRegions()[prefix]
  if (config === undefined) {
    return json({ status: 'error', message: 'Region is not configured' }, { status: 400 })
  }
  const res = await configManager.getVersions(prefix)
  return json({ name: config.name, versions: res.versions })
}
