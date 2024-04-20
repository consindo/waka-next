import { json } from '@sveltejs/kit'
import fs from 'node:fs/promises'
import { Readable } from 'node:stream'

import { ClientErrors, type Prefix } from '@lib/client'

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
    if (
      (err as App.Error).message === ClientErrors.NotFound ||
      (err as App.Error).code === 'ENOENT'
    ) {
      return json({ code: 404, error: ClientErrors.NotFound }, { status: 404 })
    } else if ((err as App.Error).code === ClientErrors.RegionNotFound) {
      return json({ code: 404, error: ClientErrors.RegionNotFound }, { status: 404 })
    }
    throw err
  }
}
