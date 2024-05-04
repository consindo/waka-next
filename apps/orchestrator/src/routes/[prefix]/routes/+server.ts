import { json } from '@sveltejs/kit'

import { ClientErrors, type Prefix } from '@lib/client'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, params, url }) => {
  const { client } = locals

  const pageSize = 100
  const page = parseInt(url.searchParams.get('page') || '') || 1
  const routeTypeMin = parseInt(url.searchParams.get('routeTypeMin') || '')
  const routeTypeMax = parseInt(url.searchParams.get('routeTypeMax') || '')

  try {
    const routes = client.getRoutes(
      params.prefix as Prefix,
      ...[pageSize, (page - 1) * pageSize, routeTypeMin, routeTypeMax].map((i) =>
        isNaN(i) ? undefined : i
      )
    )
    return json({ page, pageSize, routes })
  } catch (err) {
    if ((err as App.Error).code === ClientErrors.RegionNotFound) {
      return json({ code: 404, error: ClientErrors.RegionNotFound }, { status: 404 })
    }
    throw err
  }
}
