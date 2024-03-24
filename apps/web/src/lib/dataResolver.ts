import { browser } from '$app/environment'

import type { Client } from '@lib/client'

import { getClient, isClientReady, waitForClient } from '../lib/storage'

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
      if (!res.ok) throw `http: ${res.status}`
      const data = (await res.json()) as Type
      return { provider: 'server', data }
    } catch (err) {
      console.error(err)
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
