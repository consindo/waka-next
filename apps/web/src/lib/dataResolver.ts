import { browser } from '$app/environment'
import { parseSync } from '@loaders.gl/core'
import { WKBLoader } from '@loaders.gl/wkt'
import type { Feature } from 'geojson'

import { type Client, ClientErrors, type Prefix } from '@lib/client'

import { getClient, isClientReady, waitForClient } from '../lib/storage'

type Fetch = typeof fetch

export const resolveData = async <Type>(
  prefix: Prefix,
  httpEndpoint: string,
  clientQuery: (client: Client) => Type,
  fetch: Fetch
): Promise<{ provider: string; data: Type | null; error?: string }> => {
  if (browser && isClientReady(prefix, fetch)) {
    const client = getClient()
    try {
      const data = (await clientQuery(client)) as Type
      return { provider: 'client', data }
    } catch (err) {
      if ((err as App.Error).code === ClientErrors.NotFound) {
        return { provider: 'client', error: ClientErrors.NotFound, data: null }
      } else if ((err as App.Error).code === ClientErrors.RegionNotFound) {
        return { provider: 'client', error: ClientErrors.RegionNotFound, data: null }
      }
      throw err
    }
  } else {
    try {
      const res = await fetch(`/api/${prefix}${httpEndpoint}`)
      if (res.status === 404)
        return { provider: 'server', error: ClientErrors.NotFound, data: null }
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
