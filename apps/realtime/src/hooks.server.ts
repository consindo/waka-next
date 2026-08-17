import { type Handle } from '@sveltejs/kit'

import { startRealtime } from '$lib/realtime'

const jobs: Promise<void>[] = []
process.on('SIGINT', () => {
  console.log('Got SIGINT. Starting graceful shutdown.')
  Promise.all(jobs).then(() => {
    console.log('Jobs complete, exiting.')
    process.exit(0)
  })
})

const realtimeCache = startRealtime()

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.realtimeCache = realtimeCache

  const response = await resolve(event)
  return response
}
