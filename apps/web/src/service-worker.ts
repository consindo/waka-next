import { version } from '$service-worker'

const CACHE = `cache-${version}`

self.addEventListener('activate', (event: Event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key)
    }
  }
  // @ts-expect-error no service worker events
  event.waitUntil(deleteOldCaches())
  console.debug('serviceworker activated')
})
