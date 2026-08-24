import { type RequestHandler, json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals }) => {
  const { realtimeCache } = locals
  return json(realtimeCache)
}
