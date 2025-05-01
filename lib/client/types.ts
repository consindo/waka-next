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
  stopCode: string | null
  stopDesc: string | null
  stopLat: number
  stopLon: number
}

export interface RouteResult {
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
  routeId: string
  tripHeadsign: string
  directionId: number
  tripIds: string[]
  servicesCount: number
}
