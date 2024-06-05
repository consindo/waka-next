import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
  locals.jobs.push(
    new Promise((resolve, reject) => {
      ;(async () => {
        const regions = await locals.configManager.getRegions()
        for (const region of regions.regions) {
          const i = region.region
          await locals.configManager.checkForUpdate(i)
          const version = await locals.configManager.determineLatestVersion(i)
          if (version === null) {
            console.warn('could not determine latest version for', i)
          } else if (region.etag === version.etag) {
            console.log('region is already up to date with latest version', i, version)
          } else {
            await locals.configManager.setActiveVersion(i, version.version)
            console.log('set latest version', i, version)
          }
        }
      })()
        .then(() => resolve())
        .catch((err) => reject(err))
    })
  )
  return json({ schedule: 'success' })
}
