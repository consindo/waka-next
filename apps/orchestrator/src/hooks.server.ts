import { read } from '$app/server'
import type { Handle } from '@sveltejs/kit'
import zlib from 'node:zlib'

import { Client, type Prefix } from '@lib/client'
import { DB } from '@lib/db'

import { ConfigManager } from '$lib/configManager'

import gtfs from '../static/sample-feed-1.bin.br?url'

const db = new DB()
const client = new Client()

// adds all the regions specified in the config
const configManager = new ConfigManager()
Object.keys(configManager.getConfig().regions).forEach((region: string) => {
  client.addRegion(region as Prefix, db)
})

const loadDb = (async () => {
  const dataBr = await read(gtfs).arrayBuffer()
  const data = zlib.brotliDecompressSync(dataBr)
  await db.connect()
  db.load(data)
})()

export const handle: Handle = async ({ event, resolve }) => {
  await loadDb
  event.locals.configManager = configManager
  event.locals.client = client

  const response = await resolve(event)

  return response
}
