export type Position = [number, number]
export type Prefix = `${string}-${string}`
export type PrefixInput = Prefix | 'all'

export enum ClientErrors {
  NotFound = 'NOT_FOUND',
  RegionNotFound = 'REGION_NOT_FOUND',
}

export type InfoResult = {
  prefix: Prefix
  feedLang: string
  feedStartDate: Date
  feedEndDate: Date
  feedTimezone: string
  feedPublisherName?: string
  feedPublisherUrl?: string
  defaultLang?: string
  feedVersion?: string
  feedContactEmail?: string
  feedContactUrl?: string
}

export type BoundsResult = {
  prefix: Prefix
  bounds: [Position, Position]
}

export type StopResult = {
  prefix: Prefix
  stopId: string
  stopCode: string | null
  stopDesc: string | null
  stopLat: number
  stopLon: number
}

export type RouteResult = {
  routeShortName: string
  routeLongName: string
  agencyId: string
  routeType: string
  routeColor: string
  routeDesc: string
  routeId: string
}
