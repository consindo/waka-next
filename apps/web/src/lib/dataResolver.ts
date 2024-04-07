import { browser } from '$app/environment'

import type { Client, Prefix } from '@lib/client'

import { getClient, isClientReady, waitForClient } from '../lib/storage'

type Fetch = typeof fetch

export const resolveData = async <Type>(
  prefix: Prefix,
  httpEndpoint: string,
  clientQuery: (client: Client) => Type,
  fetch: Fetch
): Promise<{ provider: string; data: Type | null }> => {
  if (browser && isClientReady(prefix, fetch)) {
    const client = getClient()
    const data = clientQuery(client) as Type
    return { provider: 'client', data }
  } else {
    try {
      const res = await fetch(`/api/${prefix}${httpEndpoint}`)
      if (!res.ok) throw `http: ${res.status}`
      const data = (await res.json()) as Type
      return { provider: 'server', data }
    } catch (err) {
      console.error(err)
      if (browser) {
        try {
          const client = await waitForClient(prefix)
          const data = clientQuery(client) as Type
          return { provider: 'static-client', data }
        } catch (err) {
          return { provider: 'static-error', data: null }
        }
      } else {
        return { provider: 'static-server', data: null }
      }
    }
  }
}
