import { booleanIntersects, envelope, lineString } from '@turf/turf'
import type { Feature, FeatureCollection } from 'geojson'

import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import { tidyStopName } from './tidyStrings'

export const getRegionsFromBounds = (
  regionalBounds: { prefix: Prefix; bounds: Feature }[],
  mapBounds: [[number, number], [number, number]]
) => {
  const mapEnvelope = envelope(lineString(mapBounds))
  const prefixes = regionalBounds
    .filter((i) => booleanIntersects(i.bounds, mapEnvelope))
    .map((i) => i.prefix)
  return prefixes
}

export const getStops = async (
  prefixes: `${string}-${string}`[],
  mapBounds: [[number, number], [number, number]],
  includebus: boolean,
  icons: Record<string, { id: string; png: string }[]>
) => {
  // needs to be minLat, maxLat, minLon, maxLon
  const orderedMapBounds = [mapBounds[1][1], mapBounds[0][1], mapBounds[1][0], mapBounds[0][0]]
  const stops = await Promise.all(
    prefixes.map((prefix) =>
      resolveData(
        prefix,
        `/stops?bounds=${encodeURIComponent(orderedMapBounds.join(','))}&includebus=${includebus}`,
        (client) =>
          client.getStopsByLocation(
            prefix,
            orderedMapBounds[0],
            orderedMapBounds[1],
            orderedMapBounds[2],
            orderedMapBounds[3],
            includebus
          ),
        fetch
      )
    )
  )

  const routeTypeMap: Record<string, string> = {
    '0': 'pin.svg',
    '2': 'train-pin.svg',
    '3': 'bus-pin.svg',
    '4': 'ferry-pin.svg',
  }
  const mapToIcon = (prefix: string, routeType: number | undefined) => {
    const baseIconId = routeTypeMap[(routeType || 0).toString()] || routeTypeMap['0']
    if ((icons[prefix] || []).find((i) => i.id === baseIconId)) {
      return `${prefix}-${baseIconId}`
    } else {
      return `generic-${baseIconId}`
    }
  }

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
          stopName:
            i.routes[0]?.routeType !== 3 && i.stopName ? tidyStopName(i.stopName) : undefined,
          shouldZoom: i.routes[0]?.routeType === 3,
          icon: mapToIcon(i.prefix, i.routes[0]?.routeType),
        },
        geometry: {
          type: 'Point',
          coordinates: [i.stopLon, i.stopLat],
        },
      })),
  }
  return result
}
