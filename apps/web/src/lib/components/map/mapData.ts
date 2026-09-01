import { booleanIntersects, envelope, lineString } from '@turf/turf'
import type { Feature, FeatureCollection } from 'geojson'

import type { Prefix } from '@lib/client'

import { resolveData } from '$lib/dataResolver'

import { formatStopName } from '$lib/utils/formatStopName'

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

const routeTypeMap: Record<string, string> = {
  '-1': 'pin',
  '0': 'tram',
  '2': 'train',
  '3': 'bus',
  '4': 'ferry',
  '5': 'funicular',
}
export const mapToIcon = (
  prefix: string,
  routeType: number | undefined,
  iconType: 'pin' | 'vehicle',
  icons: Record<string, { id: string; png: string }[]>
) => {
  const baseIconId = routeTypeMap[(routeType || -1).toString()] || routeTypeMap['-1']
  const baseFile = `${baseIconId}-${iconType}.svg`
  if ((icons[prefix] || []).find((i) => i.id === baseFile)) {
    return `${prefix}-${baseFile}`
  } else {
    return `generic-${baseFile}`
  }
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
            i.routes[0]?.routeType !== 3 && i.stopName ? formatStopName(i.stopName) : undefined,
          shouldZoom: i.routes[0]?.routeType === 3,
          icon: mapToIcon(i.prefix, i.routes[0]?.routeType, 'pin', icons),
        },
        geometry: {
          type: 'Point',
          coordinates: [i.stopLon, i.stopLat],
        },
      })),
  }
  return result
}
