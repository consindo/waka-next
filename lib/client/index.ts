import { TarReader } from '@gera2ld/tarjs'
import { parseSync } from '@loaders.gl/core'
import { WKBLoader } from '@loaders.gl/wkt'
import { regionalConfig } from '@regions/regionalConfig'
import type { Feature } from 'geojson'

import type { DB } from '@lib/db'

import getBounds from './sql/getBounds.sql?raw'
import getInfoFromCalendar from './sql/getInfoFromCalendar.sql?raw'
import getInfoFromFeedInfo from './sql/getInfoFromFeedInfo.sql?raw'
import getRoute from './sql/getRoute.sql?raw'
import getRoutes from './sql/getRoutes.sql?raw'
import getRoutesByStops from './sql/getRoutesByStops.sql?raw'
import getServices from './sql/getServices.sql?raw'
import getShape from './sql/getShape.sql?raw'
import getStop from './sql/getStop.sql?raw'
import getStopTimes from './sql/getStopTimes.sql?raw'
import getStops from './sql/getStops.sql?raw'
import getStopsByLocation from './sql/getStopsByLocation.sql?raw'
import getStopsByLocationExcludingBus from './sql/getStopsByLocationExcludingBus.sql?raw'
import getTable from './sql/getTable.sql?raw'
import getTimetable from './sql/getTimetable.sql?raw'
import { type InfoSQLResult } from './sqlTypes'
import { convertFromGtfsDateToISOTimestamp } from './timezone'
import {
  type BoundsResponse,
  ClientErrors,
  type InfoResponse,
  type Prefix,
  type PrefixInput,
  type RouteResult,
  type RoutesByStopsResult,
  type ServiceResult,
  type StopInfoResult,
  type StopResult,
  type StopTimesResult,
  type StopsResult,
  type TimetableResult,
} from './types'

export * from './types'

const GetError = (code: ClientErrors) => {
  const err = new Error(code) as App.Error
  err.code = code
  return err
}

// TODO: needs to be updated so the Reponses use a Response Type
// while the sql responses use a sql type...

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

  getBounds(prefix: PrefixInput): BoundsResponse[] {
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

  getInfo(prefix: PrefixInput): InfoResponse[] {
    const databases = this.runQuery(prefix, getTable, ['feed_info'], false) as Record<
      Prefix,
      unknown[]
    >
    return (Object.keys(databases) as Prefix[]).flatMap((prefix) => {
      if (databases[prefix].length > 0) {
        return this.runQuery(prefix, getInfoFromFeedInfo) as InfoSQLResult[]
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

  getStopsByLocation(
    prefix: PrefixInput,
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number,
    includeBus: boolean
  ): StopsResult[] {
    const query = includeBus ? getStopsByLocation : getStopsByLocationExcludingBus
    const results = this.runQuery(prefix, query, [
      minLat.toString(),
      maxLat.toString(),
      minLon.toString(),
      maxLon.toString(),
    ]) as (StopsResult & {
      parentStopId?: string
      parentStopCode?: string
      parentStopName?: string
      parentStopDesc?: string
      parentStopLat?: number
      parentStopLon?: number
      routeType: number
      routeShortName: string
      routeColor?: string
      routeTextColor?: string
    })[]
    const groups = Object.groupBy(results, (i) => i.parentStopId || i.stopId)
    const groupedResults = Object.values(groups).flatMap((i) => {
      if (i === undefined) return []
      const stop = i[0]
      return [
        {
          prefix: stop.prefix,
          stopId: stop.parentStopId || stop.stopId,
          stopCode: stop.parentStopCode || stop.stopCode,
          stopName: stop.parentStopName || stop.stopName,
          stopDesc: stop.parentStopDesc || stop.stopDesc,
          stopLat: stop.parentStopLat || stop.stopLat,
          stopLon: stop.parentStopLon || stop.stopLon,
          routes: i
            .filter((i) => i.routeType !== null)
            .map((j) => ({
              routeType: j.routeType,
              routeShortName: j.routeShortName,
              routeColor: j.routeColor,
              routeTextColor: j.routeTextColor,
            })),
        },
      ]
    })
    return groupedResults
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
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const services = [yesterday, today, tomorrow].flatMap((dateObj) => {
      const dateInput = dateObj.toISOString().split('T')[0]
      const date = dateInput.split('-').join('')
      const dayofweek = new Date(dateInput).getUTCDay()
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
          dayofweek === 0 ? '1' : '0',
        ]) as ServiceResult[]
      ).map((i) => ({
        ...i,
        date: dateInput,
        arrivalTime: convertFromGtfsDateToISOTimestamp(dateInput, i.arrivalTime, i.timezone),
        departureTime: convertFromGtfsDateToISOTimestamp(dateInput, i.departureTime, i.timezone),
      }))
    })

    let route: RouteResult | null = null
    if (routeResult.length > 0) {
      route = routeResult[0]
    }
    return { route, services }
  }

  /*
   * Returns a list of routes
   * offset becomes the index of the regionalQuery if it is present
   */
  getRoutes(
    prefix: PrefixInput,
    limit = 100,
    offset = 0,
    routeTypeMin = 0,
    routeTypeMax = 10000
  ): RouteResult[] {
    const clauses = [
      `WHERE route_type >= (${routeTypeMin}) AND route_type <= (${routeTypeMax})`,
      `GROUP BY routes.route_id`,
      // -- Not perfect because it doesn't account for calendar_dates or frequencies
      // -- but should be good enough for a general "popularity" heuristic
      `ORDER BY services_count DESC LIMIT (${limit}) OFFSET (${offset})`,
    ]

    const routeGroup = regionalConfig[prefix as Prefix]?.routeGroups?.[offset]
    if (routeGroup) {
      clauses[0] = `WHERE ${routeGroup.where}`
      if (routeGroup.groupBy) {
        clauses[1] = `GROUP BY ${routeGroup.groupBy}`
      }
      if (routeGroup.orderBy) {
        clauses[2] = `ORDER BY ${routeGroup.orderBy}`
      } else {
        clauses[2] = `ORDER BY route_short_name`
      }
    }
    console.log(getRoutes + clauses.join('\n'))
    const result = this.runQuery(prefix, getRoutes + clauses.join('\n')) as RouteResult[]
    return result
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
   * Returns the routes that stop at a list of stops
   */
  getRoutesByStops(prefix: PrefixInput, stopIds: string[]): { routes: RoutesByStopsResult[] } {
    // sqlite does not allow an array to be passed in as a prepared statement
    const preparedRoutesByStops = getRoutesByStops.replace(/[?]/g, `'${stopIds.join("', '")}'`)
    const routes = this.runQuery(prefix, preparedRoutesByStops) as RoutesByStopsResult[]
    return { routes }
  }

  /*
   * Returns the stop times for a particular trip
   */
  getTimetable(
    prefix: PrefixInput,
    tripId: string
  ): {
    timetable: TimetableResult[]
  } {
    const timetable = this.runQuery(prefix, getTimetable, [tripId]) as TimetableResult[]
    const uniqueStops = timetable.flatMap((i) =>
      [i.stopId, i.parentStopId].filter((j) => j !== undefined)
    )
    const routes = this.getRoutesByStops(prefix, uniqueStops)

    const timetableWithTransfers = timetable.map((i) => ({
      ...i,
      transfers: routes.routes
        .filter(
          (j) =>
            j.stopId === i.stopId || (j.parentStopId !== null && j.parentStopId === i.parentStopId)
        )
        .reduce(
          (acc, cur) => {
            if (
              !acc.some(
                (j) => j.routeShortName === cur.routeShortName && j.routeType === cur.routeType
              )
            ) {
              acc.push({
                routeType: cur.routeType,
                routeShortName: cur.routeShortName,
                routeColor: cur.routeColor,
                routeTextColor: cur.routeTextColor,
              })
            }
            return acc
          },
          [] as TimetableResult['transfers']
        ),
    }))
    return { timetable: timetableWithTransfers }
  }

  /*
   * Returns the stop times for a particular stop
   */
  getStop(prefix: PrefixInput, stopId: string) {
    const stops = this.runQuery(prefix, getStop, [stopId]) as StopResult[]
    if (stops.length === 0) throw GetError(ClientErrors.NotFound)
    const stopInfo: StopInfoResult = {
      prefix: stops[0].prefix,
      stopId: stops[0].parentStopId,
      stopCode: stops[0].parentStopCode,
      stopName: stops[0].parentStopName,
      stopLat: stops[0].parentStopLat,
      stopLon: stops[0].parentStopLon,
      parentStation: stops[0].parentStation,
      childStops: stops
        .reduce(
          (acc, cur) => {
            if (!cur.stopId) return acc
            if (acc.find((i) => i.stopId === cur.stopId)) return acc
            acc.push({
              stopId: cur.stopId,
              stopName: cur.stopName,
              platformCode: cur.platformCode,
              stopLat: cur.stopLat,
              stopLon: cur.stopLon,
            })
            return acc
          },
          [] as StopInfoResult['childStops']
        )
        .sort((a, b) =>
          (a.platformCode || a.stopId).localeCompare(b.platformCode || b.stopId, 'en', {
            numeric: true,
          })
        ),
      routes: stops.reduce(
        (acc, cur) => {
          if (cur.routeType === null) return acc
          if (
            acc.find(
              (i) => i.routeType === cur.routeType && i.routeShortName === cur.routeShortName
            )
          )
            return acc

          acc.push({
            routeType: cur.routeType,
            routeShortName: cur.routeShortName,
            routeColor: cur.routeColor,
            routeTextColor: cur.routeTextColor,
          })
          return acc
        },
        [] as StopInfoResult['routes']
      ),
    }

    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const stopTimes = [yesterday, today, tomorrow].flatMap((dateObj) => {
      const dateInput = dateObj.toISOString().split('T')[0]
      const date = dateInput.split('-').join('')
      const dayofweek = new Date(dateInput).getUTCDay()
      return [stopId, ...stopInfo.childStops.map((i) => i.stopId)]
        .flatMap(
          (sid) =>
            this.runQuery(prefix, getStopTimes, [
              date,
              sid,
              date,
              date,
              dayofweek === 1 ? '1' : '0',
              dayofweek === 2 ? '1' : '0',
              dayofweek === 3 ? '1' : '0',
              dayofweek === 4 ? '1' : '0',
              dayofweek === 5 ? '1' : '0',
              dayofweek === 6 ? '1' : '0',
              dayofweek === 0 ? '1' : '0',
            ]) as StopTimesResult[]
        )
        .map((i) => ({
          ...i,
          arrivalTime: convertFromGtfsDateToISOTimestamp(
            dateInput,
            i.arrivalTime,
            i.agencyTimezone
          ),
          departureTime: convertFromGtfsDateToISOTimestamp(
            dateInput,
            i.departureTime,
            i.agencyTimezone
          ),
        }))
        .sort(
          (a, b) =>
            new Date(a.departureTime || 0).getTime() - new Date(b.departureTime || 0).getTime()
        )
    })

    return { stopInfo, stopTimes }
  }
}
