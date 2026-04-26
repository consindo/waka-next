import { regionalConfig } from '@regions/regionalConfig'

import type { Prefix, RouteResult } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'
import { defaultRouteGroups } from './defaultRouteGroups'

const defaultQueries = [
  { id: 'rail', min: 0, max: 2 },
  { id: 'bus', min: 3, max: 3 },
  { id: 'other', min: 4, max: 12 },
]

export const load: PageLoad = async ({ fetch, params }) => {
  const prefixes = params.prefix.split(',') as Prefix[]

  const queries = structuredClone(defaultQueries)
  const groups = structuredClone(defaultRouteGroups)
  const returnGroups = groups.map((i) => ({ ...i, routes: [] as RouteResult[] }))

  await Promise.all(
    prefixes.flatMap(async (prefix) => {
      if (regionalConfig[prefix].routeGroups) {
        let k = 0
        for (const i of regionalConfig[prefix].routeGroups) {
          const result = await resolveData(
            prefix,
            `/routes?offset=${k}`,
            (client) => ({ routes: client.getRoutes(prefix, undefined, k) }),
            fetch
          )
          returnGroups.push({
            name: i.name,
            emoji: '😺',
            routes: result.data?.routes || [],
            include: { routeType: [] },
          })
          k++
        }
      } else {
        const result = await Promise.all(
          queries.map((i) =>
            resolveData(
              prefix,
              `/routes?routeTypeMin=${i.min}&routeTypeMax=${i.max}`,
              (client) => ({
                routes: client.getRoutes(prefix, undefined, undefined, i.min, i.max),
              }),
              fetch
            )
          )
        )
        result.forEach((i) => {
          if (i.data === null) return
          i.data.routes.forEach((r) => {
            returnGroups.forEach((g) => {
              if (g.include.routeType.includes(r.routeType)) {
                g.routes.push(r)
              }
            })
          })
        })
      }
    })
  )

  // sort by services count for generic groups
  returnGroups.forEach((i) => {
    if (i.include.routeType.length > 0) {
      i.routes.sort((a, b) => (b.servicesCount || 0) - (a.servicesCount || 0))
    }
  })

  return { groups: returnGroups.filter((i) => i.routes.length !== 0) }
}
