import { Feature } from 'geojson'
import { describe, expect, it } from 'vitest'

import { createWkb, createWkt, importShapes, parseData } from '@lib/importer/shapes'
import { CsvParser } from '@lib/importer/csv'

const stopsText = 
  `shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled
A,2.84921,1.84921,2,20
A,4.84921,3.84921,1,0
B,2.84921,1.84921,2,20
B,4.84921,3.84921,1,0
`

const line = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [1.84921, 2.84921],
      [3.84921, 4.84921],
    ],
  },
} as Feature

describe('importer/shapes', () => {
  describe('createWkb', () => {
    it('should encode a geojson object', () => {
      const buffer = createWkb(line)
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
      expect(base64).toEqual('AQIAAAACAAAAg/qWOV2W/T9BfcucLssGQEF9y5wuyw5Aob5lTpdlE0A=')
    })
  })  

  describe('createWkt', () => {
    it('should encode a geojson object', () => {
      const str = createWkt(line)
      expect(str).toEqual('LINESTRING (1.84921 2.84921, 3.84921 4.84921)')
    })
  })

  describe('parseData', () => {
    it('should parse the data', async () => {
      const parser = new CsvParser()
      const writer = parser.writable.getWriter()
      writer.write(stopsText)
      writer.close()

      const reader = parser.readable
      const data = await parseData(reader)
      expect(data).toEqual({ A: line, B: line })
    })
  })

  describe('parseData', () => {
    it('should return a tarball', async () => {
      const parser = new CsvParser()
      const writer = parser.writable.getWriter()
      writer.write(stopsText)
      writer.close()

      const reader = parser.readable
      const data = await importShapes(reader)
      expect(data.size).toEqual(10240)
      expect(data.type).toEqual('application/x-tar')
    })
  })
})
