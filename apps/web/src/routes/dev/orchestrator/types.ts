import type { Prefix } from '@lib/client'

export type ActiveRegion = {
  region: Prefix
  url: string
  etag: string
  size: number
  shapesUrl?: string
  shapesEtag?: string
  shapesSize?: number
  bounds: [number, number][]
}

export type InactiveRegion = {
  region: Prefix
  name: string
}

export type Version = {
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
