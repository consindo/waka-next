import { json } from '@sveltejs/kit'

import { ClientErrors, type Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params, url }) => {
  const { client } = locals

  const pageSize = 100
  const offset = parseInt(url.searchParams.get('offset') || '') || 0
  const routeTypeMin = parseInt(url.searchParams.get('routeTypeMin') || '')
  const routeTypeMax = parseInt(url.searchParams.get('routeTypeMax') || '')

  try {
    const routes = client.getRoutes(
      params.prefix as Prefix,
      ...[pageSize, offset, routeTypeMin, routeTypeMax].map((i) => (isNaN(i) ? undefined : i))
    )
    return json({ offset, pageSize, routes })
  } catch (err) {
    if ((err as App.Error).code === ClientErrors.RegionNotFound) {
      return json({ code: 404, error: ClientErrors.RegionNotFound }, { status: 404 })
    }
    throw err
  }
}
