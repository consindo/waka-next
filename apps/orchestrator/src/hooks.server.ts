import { read } from '$app/server'
import type { Handle } from '@sveltejs/kit'
import zlib from 'node:zlib'

import { Client, type Prefix } from '@lib/client'
import { DB } from '@lib/db'

import { ConfigManager } from '$lib/configManager'

const client = new Client()

// adds all the regions specified in the config
const configManager = new ConfigManager()

const loadDb = (async () => {
  const regions = await configManager.getRegions()
  await Promise.all(
    regions.regions.map(async (region) => {
      console.log(`cached ${region.region} locally from ${region.url}`)
      // download to local cache
      let data: ArrayBuffer
      if (region.url.startsWith('/')) {
        const dataBr = await read(region.url).arrayBuffer()
        data = zlib.brotliDecompressSync(dataBr)
      } else {
        const res = await fetch(region.url)
        data = await res.arrayBuffer()
      }

      // connect to db
      const db = new DB()
      await db.connect()
      db.load(data)

      // done
      client.addRegion(region.region as Prefix, db)
    })
  )
})()

export const handle: Handle = async ({ event, resolve }) => {
  await loadDb
  event.locals.configManager = configManager
  event.locals.client = client

  const response = await resolve(event)

  return response
}
