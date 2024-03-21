import type { PageLoad } from './$types'
import { resolveData } from '../lib/dataResolver'

export const load: PageLoad = async ({ fetch }) => {
  const data = resolveData('/api/stops', (client) => client.getStops('all'), fetch)
  return data
}
