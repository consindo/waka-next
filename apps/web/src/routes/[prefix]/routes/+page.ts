import type { Prefix, RouteResult } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import type { PageLoad } from './$types'

const defaultQueries = [
  { id: 'rail', min: 0, max: 2 },
  { id: 'bus', min: 3, max: 3 },
  { id: 'other', min: 4, max: 12 },
]

// todo: support all the extended types
const defaultGroups = [
  { name: 'Metro', include: { routeType: [1, 12, 401] } },
  { name: 'Rail', include: { routeType: [2] } },
  { name: 'Regional Rail', include: { routeType: [106] } },
  { name: 'Ferry', include: { routeType: [4] } },
  { name: 'Light Rail', include: { routeType: [0, 5, 7, 900] } },
  { name: 'Aerial Tramway', include: { routeType: [6] } },
  { name: 'Bus', include: { routeType: [3, 11, 700] } },
  { name: 'Coaches', include: { routeType: [203, 204] } },
  { name: 'School Bus', include: { routeType: [712] } },
  { name: 'Rail Replacement', include: { routeType: [714] } },
]

export const load: PageLoad = async ({ fetch, params }) => {
  const prefix = params.prefix as Prefix

  const queries = structuredClone(defaultQueries)
  const groups = structuredClone(defaultGroups)

  // todo: regional config
  if (prefix === 'au-syd') {
    queries.push({ id: 'extended', min: 100, max: 699 })
    queries.push({ id: 'extended-bus', min: 700, max: 711 })
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
