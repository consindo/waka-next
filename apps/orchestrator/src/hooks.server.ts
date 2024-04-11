import { env } from '$env/dynamic/private'
import { type Handle, json } from '@sveltejs/kit'

import { Client } from '@lib/client'

import { ConfigManager } from '$lib/configManager'
import { loadDb } from '$lib/loadDb'

const jobs: Promise<void>[] = []
process.on('SIGINT', () => {
  console.log('Got SIGINT. Starting graceful shutdown.')
  Promise.all(jobs).then(() => {
    console.log('Jobs complete, exiting.')
    process.exit(0)
  })
})

const client = new Client()
const configManager = new ConfigManager()
const regions = await configManager.getRegions()
const load = loadDb(client, regions)

export const handle: Handle = async ({ event, resolve }) => {
  await load
  event.locals.configManager = configManager
  event.locals.client = client
  event.locals.jobs = jobs

  // only one token supported at the moment
  if (new URL(event.request.url).pathname.startsWith('/admin')) {
    if (
      event.request.headers.get('Authorization') !== `Bearer ${env.WAKA_ORCHESTRATOR_ACCESS_TOKEN}`
    ) {
      return json({ status: 'error', logs: ['403: Unauthorized'] }, { status: 403 })
    }
  }

  const response = await resolve(event)

  return response
}
