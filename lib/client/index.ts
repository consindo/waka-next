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

  runQuery = (prefix: PrefixInput, query: string): unknown => {
    const databases: Prefix[] = prefix === 'all' ? (Object.keys(this.db) as Prefix[]) : [prefix]
    return databases.flatMap((i) => this.db[i].execObject(query).map((j) => ({ prefix: i, ...j })))
  }

  addRegion(prefix: Prefix, db: DB) {
    this.db[prefix] = db
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
}
