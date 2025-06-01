import { TarReader } from '@gera2ld/tarjs'
import { parseSync } from '@loaders.gl/core'
import { WKBLoader } from '@loaders.gl/wkt'
import type { Feature } from 'geojson'

import type { DB } from '@lib/db'

import getBounds from './sql/getBounds.sql?raw'
import getInfoFromCalendar from './sql/getInfoFromCalendar.sql?raw'
import getInfoFromFeedInfo from './sql/getInfoFromFeedInfo.sql?raw'
import getRoute from './sql/getRoute.sql?raw'
import getRoutes from './sql/getRoutes.sql?raw'
import getServices from './sql/getServices.sql?raw'
import getShape from './sql/getShape.sql?raw'
import getStop from './sql/getStop.sql?raw'
import getStopTimes from './sql/getStopTimes.sql?raw'
import getStops from './sql/getStops.sql?raw'
import getTable from './sql/getTable.sql?raw'
import getTimetable from './sql/getTimetable.sql?raw'
import {
  type BoundsResult,
  ClientErrors,
  type InfoResult,
  type Prefix,
  type PrefixInput,
  type RouteResult,
  type ServiceResult,
  type StopResult,
  type StopsResult,
  type TimetableResult,
} from './types'

export * from './types'

const GetError = (code: ClientErrors) => {
  const err = new Error(code) as App.Error
  err.code = code
  return err
}

export class Client {
  db: Record<Prefix, DB> = {}
  shapes: Record<Prefix, Blob | string> = {}
  loadedVersions: Record<Prefix, string> = {}

  runQuery = (prefix: PrefixInput, query: string, params?: string[], flatMap = true): unknown => {
    if (prefix !== 'all' && !this.hasRegion(prefix)) throw GetError(ClientErrors.RegionNotFound)
    const databases: Prefix[] = prefix === 'all' ? (Object.keys(this.db) as Prefix[]) : [prefix]
    const cb = (i: Prefix) => this.db[i].execObject(query, params).map((j) => ({ prefix: i, ...j }))
    return flatMap
      ? databases.flatMap(cb)
      : databases.reduce(
          (acc, cur) => {
            acc[cur] = cb(cur)
            return acc
          },
          {} as Record<Prefix, unknown>
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

  getInfo(prefix: PrefixInput): InfoResult[] {
    const databases = this.runQuery(prefix, getTable, ['feed_info'], false) as Record<
      Prefix,
      unknown[]
    >
    return (Object.keys(databases) as Prefix[]).flatMap((prefix) => {
      if (databases[prefix].length > 0) {
        return this.runQuery(prefix, getInfoFromFeedInfo) as InfoResult[]
      }
      const calendarInfo = this.runQuery(prefix, getInfoFromCalendar) as {
        feedStartDate: Date
        feedEndDate: Date
        feedTimezone: string
      }[]
      return {
        prefix,
        feedLang: 'en',
        feedStartDate: calendarInfo[0].feedStartDate,
        feedEndDate: calendarInfo[0].feedEndDate,
        feedTimezone: calendarInfo[0].feedTimezone,
      }
    })
  }

  getStops(prefix: PrefixInput, searchTerm: string): StopsResult[] {
    return this.runQuery(prefix, getStops, [`%${searchTerm}%`, `%${searchTerm}%`]) as StopsResult[]
  }

  /*
   * Returns infomation about the route and the services that form the route
   */
  getRoute(
    prefix: PrefixInput,
    routeId: string,
    stopSequence = 1
  ): { route: RouteResult | null; services: ServiceResult[] } {
    const routeResult = this.runQuery(prefix, getRoute, [routeId]) as RouteResult[]

    // todo: need to be able to query for a specific date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const services = [yesterday, today, tomorrow].flatMap((dateObj) => {
      const dateInput = dateObj.toISOString().split('T')[0]
      const date = dateInput.split('-').join('')
      const dayofweek = new Date(dateInput).getDay()
      return (
        this.runQuery(prefix, getServices, [
          date,
          routeId,
          stopSequence.toString(),
          date,
          date,
          dayofweek === 1 ? '1' : '0',
          dayofweek === 2 ? '1' : '0',
          dayofweek === 3 ? '1' : '0',
          dayofweek === 4 ? '1' : '0',
          dayofweek === 5 ? '1' : '0',
          dayofweek === 6 ? '1' : '0',
          dayofweek === 7 ? '1' : '0',
        ]) as ServiceResult[]
      ).map((i) => ({ ...i, date: dateInput }))
    })

    let route: RouteResult | null = null
    if (routeResult.length > 0) {
      route = routeResult[0]
    }
    return { route, services }
  }

  /*
   * Returns a list of routes
   */
  getRoutes(
    prefix: PrefixInput,
    limit = 100,
    offset = 0,
    routeTypeMin = 0,
    routeTypeMax = 10000
  ): RouteResult[] {
    return this.runQuery(
      prefix,
      getRoutes,
      [routeTypeMin, routeTypeMax, limit, offset].map((i) => i.toString())
    ) as RouteResult[]
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

  /*
   * Returns the stop times for a particular trip
   */
  getTimetable(prefix: PrefixInput, tripId: string): { timetable: TimetableResult[] } {
    const timetable = this.runQuery(prefix, getTimetable, [tripId]) as TimetableResult[]
    return { timetable }
  }

  /*
   * Returns the stop times for a particular stop
   */
  getStop(prefix: PrefixInput, stopId: string) {
    const stops = this.runQuery(prefix, getStop, [stopId]) as StopResult[]
    if (stops.length === 0) throw GetError(ClientErrors.NotFound)
    const stopInfo = {
      stopId: stops[0].parentStopId,
      stopCode: stops[0].parentStopCode,
      stopName: stops[0].parentStopName,
      stopLat: stops[0].stopLat,
      stopLon: stops[0].stopLon,
      parentStation: stops[0].parentStation,
      childStops: stops
        .flatMap((i) => {
          if (!i.stopId) return []
          return [
            {
              stopId: i.stopId,
              stopName: i.stopName,
              platformCode: i.platformCode,
            },
          ]
        })
        .sort((a, b) =>
          (a.platformCode || a.stopId).localeCompare(b.platformCode || b.stopId, 'en', {
            numeric: true,
          })
        ),
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const stopTimes = [yesterday, today, tomorrow].flatMap((dateObj) => {
      const dateInput = dateObj.toISOString().split('T')[0]
      const date = dateInput.split('-').join('')
      const dayofweek = new Date(dateInput).getDay()
      return (
        this.runQuery(prefix, getStopTimes, [
          date,
          stopId,
          date,
          date,
          dayofweek === 1 ? '1' : '0',
          dayofweek === 2 ? '1' : '0',
          dayofweek === 3 ? '1' : '0',
          dayofweek === 4 ? '1' : '0',
          dayofweek === 5 ? '1' : '0',
          dayofweek === 6 ? '1' : '0',
          dayofweek === 7 ? '1' : '0',
        ]) as ServiceResult[]
      ).map((i) => ({ ...i, date: dateInput }))
    })

    return { stopInfo, stopTimes }
  }
}
