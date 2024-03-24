import { resolveData } from '../../lib/dataResolver'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
  const data = resolveData('/api/routes', (client) => client.getRoutes('all'), fetch)
  return data
}
