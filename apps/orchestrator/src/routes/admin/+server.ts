import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const { configManager } = locals
  const res = configManager.getConfig()
  return json(res)
}
