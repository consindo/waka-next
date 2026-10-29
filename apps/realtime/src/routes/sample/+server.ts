import { type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals }) => {
  const { realtimeCache } = locals
  return Response.json(realtimeCache)
}
