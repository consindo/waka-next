import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

import { loadDb } from '$lib/loadDb'
import type { RegionResult } from '$lib/types'

import type { RequestHandler } from './$types'

const cacheDuration = env.WAKA_ORCHESTRATOR_CACHE_PERIOD
  ? parseInt(env.WAKA_ORCHESTRATOR_CACHE_PERIOD)
  : 0

let cachedRegions: RegionResult
let cacheTime: Date

export const GET: RequestHandler = async ({ locals }) => {
  const { configManager, client } = locals

  // caches endpoint result
  if (cachedRegions === undefined || new Date().getTime() - cacheTime.getTime() > cacheDuration) {
    const regionsPromise = configManager.getRegions().then((r) => {
      cachedRegions = r
      loadDb(client, r)
    })
    cacheTime = new Date()
    if (cachedRegions === undefined) await regionsPromise
  }

  return json({ regions: cachedRegions.regions })
}
