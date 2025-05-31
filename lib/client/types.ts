export type Position = [number, number]
export type Prefix = `${string}-${string}`
export type PrefixInput = Prefix | 'all'

export enum ClientErrors {
  NotFound = 'NOT_FOUND',
  RegionNotFound = 'REGION_NOT_FOUND',
}

export interface InfoResult {
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

export interface BoundsResult {
  prefix: Prefix
  bounds: [Position, Position]
}

export interface StopResult {
  prefix: Prefix
  stopId: string
  stopCode?: string
  stopName?: string
  stopDesc?: string
  stopLat: number
  stopLon: number
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
  departureTime: string
  timezone: string
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
  stopId?: string
  stopCode?: string
  stopName?: string
  parentStopId?: string
  parentStopCode?: string
  parentStopName?: string
}
