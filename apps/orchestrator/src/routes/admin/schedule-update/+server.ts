import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
  locals.jobs.push(
    new Promise((resolve, reject) => {
      ;(async () => {
        const regions = Object.keys(locals.configManager.getConfiguredRegions()) as Prefix[]
        for (const i of regions) {
          await locals.configManager.checkForUpdate(i)
          const version = await locals.configManager.determineLatestVersion(i)
          if (version === null) {
            console.warn('could not determine latest version for', i)
          } else {
            await locals.configManager.setActiveVersion(i, version)
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
