import { WAKA_ORCHESTRATOR_CACHE_PERIOD } from '$app/env/private'
import { regionalConfig } from '@regions/regionalConfig'
import type { RegionResponse } from '@lib/client'
import { loadDb } from '#lib/loadDb.ts'
import type { RegionResult } from '#lib/types.ts'
import type { RequestHandler } from './$types'

const cacheDuration = WAKA_ORCHESTRATOR_CACHE_PERIOD ? parseInt(WAKA_ORCHESTRATOR_CACHE_PERIOD) : 0
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

  const regionsWithConfig: RegionResponse[] = cachedRegions.regions.map((i) => {
    if (regionalConfig[i.region]) {
      return {
        ...i,
        cities: regionalConfig[i.region].cities,
      }
    }
    return {
      ...i,
      cities: [
        {
          id: i.region,
          title: i.region,
          startingLocation: [
            (i.bounds[0][0] + i.bounds[1][0]) / 2,
            (i.bounds[0][1] + i.bounds[1][1]) / 2,
          ],
        },
      ],
    }
  })

  return Response.json({ regions: regionsWithConfig })
}
