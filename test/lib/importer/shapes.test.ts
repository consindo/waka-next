import { Feature } from 'geojson'
import { describe, expect, it } from 'vitest'

import { createWkb, createWkt } from '@lib/importer/shapes'

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

  // todo: tests for parsedata & import shapes
})
