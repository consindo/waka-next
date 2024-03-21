import type { PageLoad } from './$types'
import { shouldRetrieveFromServer } from '../lib/dataResolver'
import { getClient } from '../lib/storage'
import { variables } from '../lib/variables'

export const load: PageLoad = async ({ fetch }) => {
  if (shouldRetrieveFromServer()) {
    try {
      const res = await fetch(variables.gtfsHttpEndpoint)
      const data = await res.json()
      return { provider: 'server', data }
    } catch (err) {
      return { provider: 'static', data: null }
    }
  } else {
    const client = getClient()
    const data = client.getStops('all')
    return { provider: 'client', data }
  }
}
