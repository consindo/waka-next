import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, params, request }) => {
  const prefix = params.prefix as Prefix
  const body = await request.json()
  const version = body.version
  if (version == null || version === '') {
    return json({ status: 'error', prefix, message: 'version must be set' }, { status: 400 })
  }
  try {
    await locals.configManager.setActiveVersion(prefix, version)
  } catch (err) {
    console.error(err)
    return json({ status: 'error', prefix }, { status: 500 })
  }
  return json({ status: 'success', prefix, version })
}
