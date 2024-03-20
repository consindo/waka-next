import { read } from '$app/server'
import { DB } from '@lib/db'
import { Client } from '@lib/client'
import gtfs from '../../../static/sample-feed-1.bin.br?url'
import { json } from '@sveltejs/kit'
import zlib from 'node:zlib'

const db = new DB()
const client = new Client()
client.addRegion('zz-sample1', db)

const loadDb = (async () => {
  const dataBr = await read(gtfs).arrayBuffer()
  const data = zlib.brotliDecompressSync(dataBr)
  await db.connect()
  db.load(data)
})()

export const GET = async () => {
  await loadDb
  const stops = client.getStops('all')
  return json(stops)
}
