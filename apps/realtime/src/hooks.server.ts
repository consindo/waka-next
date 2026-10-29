import type { Handle } from '@sveltejs/kit/hooks'

import { RealtimeConfigManager } from '#lib/configManager.ts'
import { startRealtime } from '#lib/realtime.ts'

const jobs: Promise<void>[] = []

process.on('SIGINT', () => {
  console.log('Got SIGINT. Starting graceful shutdown.')
  Promise.all(jobs).then(() => {
    console.log('Jobs complete, exiting.')
    process.exit(0)
  })
})

const configManager = new RealtimeConfigManager()
const regions = configManager.getRegions()
const realtimeCache = startRealtime(Object.keys(regions).map((id) => ({ ...regions[id], id })))

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.configManager = configManager
  event.locals.realtimeCache = realtimeCache

  const response = await resolve(event)
  return response
}
