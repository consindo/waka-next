import { read } from '$app/server'
import gtfs from '../../../static/sample-feed-1.bin.br?url'

export const GET = async () => {
  const data = await read(gtfs).arrayBuffer()
  return new Response(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Encoding': 'br',
      'Content-Type': 'application/x-sqlite3',
    },
  })
}
