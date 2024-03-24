import { resolveData } from '../lib/dataResolver'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
  const data = resolveData('/api/stops', (client) => client.getStops('all'), fetch)
  return data
}
