import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const { configManager } = locals
  const res = await configManager.getRegions()
  return json({ regions: res.regions })
}
