import type { Handle } from '@sveltejs/kit'

import { Client } from '@lib/client'

import { ConfigManager } from '$lib/configManager'
import { loadDb } from '$lib/loadDb'

const client = new Client()
const configManager = new ConfigManager()
const regions = await configManager.getRegions()
const load = loadDb(client, regions)

export const handle: Handle = async ({ event, resolve }) => {
  await load
  event.locals.configManager = configManager
  event.locals.client = client

  const response = await resolve(event)

  return response
}
