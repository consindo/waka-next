import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const { configManager } = locals
  const regions = Object.entries(configManager.getConfiguredRegions()).map(([key, value]) => {
    return {
      region: key,
      name: value.name,
    }
  })
  return Response.json({ regions })
}
