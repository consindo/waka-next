import { browser } from '$app/environment'
import { parseSync } from '@loaders.gl/core'
import { WKBLoader } from '@loaders.gl/wkt'
import type { Feature } from 'geojson'

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
    const data = (await clientQuery(client)) as Type
    return { provider: 'client', data }
  } else {
    try {
      const res = await fetch(`/api/${prefix}${httpEndpoint}`)
      if (!res.ok) throw `http: ${res.status}`
      // assumes it's a wkb
      if (res.headers.get('Content-Type') === 'application/octet-stream') {
        const buffer = await res.arrayBuffer()
        const geometry = parseSync(buffer, WKBLoader, { wkb: { shape: 'geojson-geometry' } })
        const feature = { type: 'Feature', properties: {}, geometry: geometry } as Feature
        return { provider: 'server', data: feature as Type }
      } else {
        const data = (await res.json()) as Type
        return { provider: 'server', data }
      }
    } catch (err) {
      console.error(err)
      if (browser) {
        try {
          const client = await waitForClient(prefix)
          const data = (await clientQuery(client)) as Type
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
