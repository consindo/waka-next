export type Position = [number, number]
export type Prefix = `${string}-${string}`
export type PrefixInput = Prefix | 'all'

export enum ClientErrors {
  NotFound = 'NOT_FOUND',
  RegionNotFound = 'REGION_NOT_FOUND',
}

export interface InfoResponse {
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

export interface BoundsResponse {
  prefix: Prefix
  bounds: [Position, Position]
}

export interface StopsResult {
  prefix: Prefix
  stopId: string
  stopCode?: string
  stopName?: string
  stopDesc?: string
  stopLat: number
  stopLon: number
  routes: {
    routeType: number
    routeShortName: string
    routeColor?: string
    routeTextColor?: string
  }[]
}

export interface StopInfoResult {
  prefix: Prefix
  stopId: string
  stopCode?: string
  stopName?: string
  stopLat: number
  stopLon: number
  parentStation?: string
  childStops: {
    stopId: string
    stopName?: string
    platformCode?: string
    stopLat: number
    stopLon: number
  }[]
  routes: {
    routeType: number
    routeShortName: string
    routeColor?: string
    routeTextColor?: string
  }[]
}

export interface StopResult {
  prefix: Prefix
  parentStopId: string
  parentStopCode?: string
  parentStopName: string
  parentStopLat: number
  parentStopLon: number
  stopLat: number
  stopLon: number
  parentStation?: string
  stopId?: string
  stopName?: string
  platformCode?: string
  routeType: number
  routeShortName: string
  routeColor?: string
  routeTextColor?: string
}

export interface RouteResult {
  prefix: Prefix
  routeId: string
  agencyId: string
  routeShortName: string
  routeLongName?: string
  routeDesc?: string
  routeType: number
  routeUrl?: string
  routeColor?: string
  routeTextColor?: string
  routeSortOrder?: string
  continuousPickup?: number
  continuousDropOff?: number
  networkId?: string
  servicesCount?: number
  tripHeadsign?: string
}

export interface ServiceResult {
  prefix: Prefix
  routeId: string
  tripHeadsign: string
  directionId: number
  tripId: string
  date: string
  arrivalTime?: string
  departureTime?: string
  timezone: string
  shapeId?: string
  routeColor?: string
  routeTextColor?: string
}

export interface RoutesByStopsResult {
  prefix: Prefix
  stopId: string
  parentStopId?: string
  routeType: number
  routeShortName: string
  routeColor?: string
  routeTextColor?: string
}

export interface TimetableResult {
  prefix: Prefix
  tripId: string
  arrivalTime?: string
  departureTime?: string
  stopSequence: number
  stopHeadsign?: string
  pickupType?: number
  dropOffType?: number
  continuousPickup?: number
  continuousDropOff?: number
  shapeDistTraveled?: number
  timepoint?: number
  stopId: string
  stopCode?: string
  stopName?: string
  stopLat: number
  stopLon: number
  parentStopId?: string
  parentStopCode?: string
  parentStopName?: string
  transfers: {
    routeType: number
    routeShortName: string
    routeColor?: string
    routeTextColor?: string
  }[]
}

export interface StopTimesResult {
  prefix: Prefix
  tripId: string
  stopId: string
  arrivalTime?: string
  departureTime?: string
  stopSequence: number
  stopHeadsign?: string
  routeId: string
  directionId: number
  tripHeadsign?: string
  tripShortName?: string
  wheelchairAccessible?: number
  bikesAllowed?: number
  routeShortName?: string
  routeLongName?: string
  routeColor?: string
  routeTextColor?: string
  routeType: number
  agencyTimezone: string
  agencyName: string
  agencyUrl: string
  agencyFareUrl?: string
  agencyPhone?: string
}

export interface RegionResponse {
  region: Prefix
  etag: string
  size: number
  url: string
  shapesEtag?: string
  shapesSize?: number
  shapesUrl?: string
  bounds: [number, number][]
  cities: {
    id: string
    title: string
    startingLocation: Position
    subtitle?: string
  }[]
}
