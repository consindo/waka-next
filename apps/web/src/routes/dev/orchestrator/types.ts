import type { Prefix } from '@lib/client'

export type ActiveRegion = {
  region: Prefix
  etag: string
  size: number
  url: string
  bounds: [number, number][]
}

export type InactiveRegion = {
  region: Prefix
  name: string
}

export type Version = {
  prefix: Prefix
  version: string
  date: string
  url: string
  etag: string
  size: number
}
