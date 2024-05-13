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
  const prefix = params.prefix as Prefix

  const queries = structuredClone(defaultQueries)
  const groups = structuredClone(defaultRouteGroups)

  // todo: regional config
  if (prefix === 'au-syd') {
    queries.push({ id: 'extended', min: 100, max: 699 })
    queries.push({ id: 'extended-bus', min: 700, max: 711 }) // ignore school bus
    queries.push({ id: 'extended-extra', min: 714, max: 1000 })
  }

  const data = await Promise.all(
    queries.map((i) =>
      resolveData(
        prefix,
        `/routes?routeTypeMin=${i.min}&routeTypeMax=${i.max}`,
        (client) => ({ routes: client.getRoutes(prefix, undefined, undefined, i.min, i.max) }),
        fetch
      )
    )
  )

  const returnGroups = groups.map((i) => ({ ...i, routes: [] as RouteResult[] }))

  data.forEach((i) => {
    if (i.data === null) return
    i.data.routes.forEach((r) => {
      returnGroups.forEach((g) => {
        if (g.include.routeType.includes(r.routeType)) {
          g.routes.push(r)
        }
      })
    })
  })

  // sort by services count
  returnGroups.forEach((i) =>
    i.routes.sort((a, b) => (b.servicesCount || 0) - (a.servicesCount || 0))
  )

  return { groups: returnGroups.filter((i) => i.routes.length !== 0) }
}
