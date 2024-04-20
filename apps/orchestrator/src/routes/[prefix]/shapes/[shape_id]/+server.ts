import { json } from '@sveltejs/kit'
import fs from 'node:fs/promises'
import { Readable } from 'node:stream'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params }) => {
  const { client } = locals
  const shape = client.getShape(params.prefix as Prefix, params.shape_id)

  try {
    const file = await fs.open(shape!)
    const stream = file.createReadStream()
    const webstream = Readable.toWeb(stream) as ReadableStream
    return new Response(webstream)
  } catch (err) {
    return json({ error: 'not found' }, { status: 404 })
  }
}
