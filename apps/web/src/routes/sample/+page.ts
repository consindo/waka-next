import type { PageLoad } from './$types'
import { resolveData } from '../../lib/dataResolver'

export const load: PageLoad = async ({ fetch }) => {
  const data = resolveData('/api/routes', (client) => client.getRoutes('all'), fetch)
  return data
}
