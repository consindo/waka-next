import type { Prefix } from '@lib/client'

export interface ActiveRegion {
  region: Prefix
  url: string
  etag: string
  size: number
  shapesUrl?: string
  shapesEtag?: string
  shapesSize?: number
  bounds: [number, number][]
}

export interface InactiveRegion {
  region: Prefix
  name: string
}

export interface Version {
  region: Prefix
  version: string
  date: string
  url: string
  etag: string
  size: number
  shapesUrl?: string
  shapesEtag?: string
  shapesSize?: number
}
