import { json } from '@sveltejs/kit'
import fs from 'node:fs/promises'
import { Readable } from 'node:stream'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params }) => {
  const { client } = locals
  try {
    const shape = await client.getShape(params.prefix as Prefix, params.shape_id)
    if (typeof shape === 'string') {
      const file = await fs.open(shape!)
      const stream = file.createReadStream()
      const webstream = Readable.toWeb(stream) as ReadableStream
      return new Response(webstream, { headers: { 'content-type': 'application/octet-stream' } })
    }
    return json(shape)
  } catch (err) {
    if ((err as Error).message === 'not found') {
      return json({ code: 404, error: 'not found' }, { status: 404 })
    }
    throw err
  }
}
