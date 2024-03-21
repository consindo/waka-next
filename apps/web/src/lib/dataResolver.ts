import { waitForClient, isClientReady, getClient } from '../lib/storage'
import { browser } from '$app/environment'
import type { Client } from '@lib/client'

type Fetch = typeof fetch

export const resolveData = async <Type>(
  httpEndpoint: string,
  clientQuery: (client: Client) => Type,
  fetch: Fetch
): Promise<{ provider: string; data: Type | null }> => {
  if (browser && isClientReady()) {
    const client = getClient()
    const data = clientQuery(client) as Type
    return { provider: 'client', data }
  } else {
    try {
      const res = await fetch(httpEndpoint)
      const data = (await res.json()) as Type
      return { provider: 'server', data }
    } catch (err) {
      if (browser) {
        const client = await waitForClient
        const data = clientQuery(client) as Type
        return { provider: 'static-client', data }
      } else {
        return { provider: 'static-server', data: null }
      }
    }
  }
}
