import type { DB } from '@lib/db'

import getBounds from './sql/getBounds.sql?raw'
import getRoutes from './sql/getRoutes.sql?raw'
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

export class Client {
  db: Record<Prefix, DB> = {}
  shapes: Record<Prefix, Blob | string> = {}

  runQuery = (prefix: PrefixInput, query: string): unknown => {
    const databases: Prefix[] = prefix === 'all' ? (Object.keys(this.db) as Prefix[]) : [prefix]
    return databases.flatMap((i) => this.db[i].execObject(query).map((j) => ({ prefix: i, ...j })))
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

  getShape(prefix: PrefixInput, shapeId: string) {
    if (prefix === 'all') return // need to handle this seperately

    const shapesDb = this.shapes[prefix]
    if (shapesDb === undefined) {
      // todo: run a db query if the shapes aren't there
    } else {
      if (typeof shapesDb === 'string') {
        return `${shapesDb}${btoa(shapeId)}.wkb`
      } else {
        // todo: read tar if it's local
      }
    }
  }
}
