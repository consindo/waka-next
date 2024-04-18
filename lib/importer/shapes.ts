import { TarWriter } from '@gera2ld/tarjs'
import { encodeSync } from '@loaders.gl/core'
import { WKBWriter, WKTWriter } from '@loaders.gl/wkt'
import type { Feature, LineString } from 'geojson'

export const createWkb = (feature: Feature): ArrayBuffer => {
  const buffer = encodeSync(feature.geometry, WKBWriter, { wkt: { hasZ: false, hasM: false } })
  return buffer
}

export const createWkt = (feature: Feature): string => {
  const buffer = encodeSync(feature.geometry, WKTWriter, { wkt: { hasZ: false, hasM: false } })
  const decoder = new TextDecoder()
  const str = decoder.decode(buffer)
  return str
}

export const parseData = async (
  data: ReadableStream
): Promise<Record<string, Feature<LineString>>> => {
  const output: Record<string, Feature<LineString>> = {}
  const reader = data.getReader()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read() // async interables not supported yet
    if (done) break

    value.data.forEach((row: string[]) => {
      const id = row[value.schema['shape_id']]
      const coords = [
        parseFloat(row[value.schema['shape_pt_lon']]),
        parseFloat(row[value.schema['shape_pt_lat']]),
      ]
      if (output[id] === undefined) {
        output[id] = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        }
      }
      output[id].geometry.coordinates.push(coords)
    })
  }
  return output
}

export const importShapes = async (data: ReadableStream): Promise<Blob> => {
  const geojson = await parseData(data)
  const writer = new TarWriter()
  Object.keys(geojson).forEach((i) => {
    writer.addFile(`${i}.wkb`, createWkb(geojson[i]))
  })
  const tar = await writer.write()
  return tar
}
