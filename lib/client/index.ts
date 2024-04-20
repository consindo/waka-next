import { TarReader } from '@gera2ld/tarjs'
import { parseSync } from '@loaders.gl/core'
import { WKBLoader } from '@loaders.gl/wkt'
import type { Feature } from 'geojson'

import type { DB } from '@lib/db'

import getBounds from './sql/getBounds.sql?raw'
import getRoutes from './sql/getRoutes.sql?raw'
import getShape from './sql/getShape.sql?raw'
import getStops from './sql/getStops.sql?raw'

export type Prefix = `${string}-${string}`
type PrefixInput = Prefix | 'all'

type Position = [number, number]

type BoundsResult = {
  prefix: Prefix
  bounds: [Position, Position]
}

type StopResult = {
  prefix: Prefix
  stopId: string
  stopCode: string | null
  stopDesc: string | null
  stopLat: number
  stopLon: number
}

type RouteResult = {
  routeShortName: string
  routeLongName: string
  agencyId: string
  routeType: string
  routeColor: string
  routeDesc: string
  routeId: string
}

export enum ClientErrors {
  NotFound = 'NOT_FOUND',
  RegionNotFound = 'REGION_NOT_FOUND',
}

const GetError = (code: ClientErrors) => {
  const err = new Error(code) as App.Error
  err.code = code
  return err
}

export class Client {
  db: Record<Prefix, DB> = {}
  shapes: Record<Prefix, Blob | string> = {}

  runQuery = (prefix: PrefixInput, query: string, params?: string[]): unknown => {
    if (prefix !== 'all' && !this.hasRegion(prefix)) throw GetError(ClientErrors.RegionNotFound)
    const databases: Prefix[] = prefix === 'all' ? (Object.keys(this.db) as Prefix[]) : [prefix]
    return databases.flatMap((i) =>
      this.db[i].execObject(query, params).map((j) => ({ prefix: i, ...j }))
    )
  }

  addRegion(prefix: Prefix, db: DB, shapes?: Blob | string) {
    this.db[prefix] = db

    // shapes can either be a
    // - blob - the tar itself,
    // - string - the path on disk
    // - undefined - read the shapes table in sqlite
    if (shapes) {
      this.shapes[prefix] = shapes
    }
  }

  hasRegion(prefix: Prefix) {
    return this.db[prefix] !== undefined
  }

  getBounds(prefix: PrefixInput): BoundsResult[] {
    const result = this.runQuery(prefix, getBounds) as {
      prefix: Prefix
      maxLat: number
      maxLon: number
      minLat: number
      minLon: number
    }[]
    return result.map((r) => ({
      prefix: r.prefix,
      bounds: [
        [r.maxLon, r.maxLat],
        [r.minLon, r.minLat],
      ],
    }))
  }

  getStops(prefix: PrefixInput): StopResult[] {
    return this.runQuery(prefix, getStops) as StopResult[]
  }

  getRoutes(prefix: PrefixInput): RouteResult[] {
    return this.runQuery(prefix, getRoutes) as RouteResult[]
  }

  async getShape(prefix: Prefix, shapeId: string): Promise<Feature | string> {
    if (!this.hasRegion(prefix)) throw GetError(ClientErrors.RegionNotFound)
    const shapesDb = this.shapes[prefix]
    if (shapesDb === undefined) {
      try {
        const results = this.runQuery(prefix, getShape, [shapeId]) as {
          shapePtLat: number
          shapePtLon: number
        }[]
        if (results.length > 0) {
          return {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: results.map((i) => [i.shapePtLon, i.shapePtLat]),
            },
          } as Feature
        }
        throw GetError(ClientErrors.NotFound)
      } catch {
        throw GetError(ClientErrors.NotFound)
      }
    } else {
      if (typeof shapesDb === 'string') {
        return `${shapesDb}${btoa(shapeId)}.wkb`
      } else {
        const blob = await TarReader.load(shapesDb)
        let buffer: ArrayBuffer
        try {
          buffer = await blob.getFileBlob(btoa(shapeId) + '.wkb').arrayBuffer()
        } catch {
          throw GetError(ClientErrors.NotFound)
        }
        const geometry = parseSync(buffer, WKBLoader, { wkb: { shape: 'geojson-geometry' } })
        return {
          type: 'Feature',
          properties: {},
          geometry,
        } as Feature
      }
    }
  }
}
