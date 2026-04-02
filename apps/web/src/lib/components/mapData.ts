import { booleanIntersects, envelope, lineString } from '@turf/turf'
import type { Feature, FeatureCollection } from 'geojson'

import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

export const getStops = async (
  regionalBounds: { prefix: Prefix; bounds: Feature }[],
  mapBounds: [[number, number], [number, number]]
) => {
  const mapEnvelope = envelope(lineString(mapBounds))
  const prefixes = regionalBounds
    .filter((i) => booleanIntersects(i.bounds, mapEnvelope))
    .map((i) => i.prefix)

  // needs to be minLat, maxLat, minLon, maxLon
  const orderedMapBounds = [mapBounds[1][1], mapBounds[0][1], mapBounds[1][0], mapBounds[0][0]]
  const stops = await Promise.all(
    prefixes.map((prefix) =>
      resolveData(
        prefix,
        `/stops?bounds=${encodeURIComponent(orderedMapBounds.join(','))}`,
        (client) =>
          client.getStopsByLocation(
            prefix,
            orderedMapBounds[0],
            orderedMapBounds[1],
            orderedMapBounds[2],
            orderedMapBounds[3]
          ),
        fetch
      )
    )
  )

  const result: FeatureCollection = {
    type: 'FeatureCollection',
    features: stops
      .map((i) => i.data || [])
      .flat()
      .map((i) => ({
        type: 'Feature',
        properties: {
          prefix: i.prefix,
          stopId: i.stopId,
          routeType: (i.routes[0]?.routeType || 3).toString(),
        },
        geometry: {
          type: 'Point',
          coordinates: [i.stopLon, i.stopLat],
        },
      })),
  }
  return result
}
