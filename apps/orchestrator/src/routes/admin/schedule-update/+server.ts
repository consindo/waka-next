import { json } from '@sveltejs/kit'

import type { Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals }) => {
  locals.jobs.push(
    new Promise((resolve, reject) => {
      ; (async () => {
        const regions = Object.keys(locals.configManager.getConfiguredRegions()) as Prefix[]
        for (const i of regions) {
          await locals.configManager.checkForUpdate(i)
        }
      })().then(() => resolve()).catch(err => reject(err))
    })
  )
  return json({ schedule: 'success' })
}
