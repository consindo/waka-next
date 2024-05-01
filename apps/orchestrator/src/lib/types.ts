import type { Prefix } from '@lib/client'

type RegionConfig = {
  name: string
  shouldCache?: boolean
  gtfsZipUrl: string
  gtfsZipHeaders?: Record<string, string>
  gtfsZipDisableEtag?: boolean
  gtfsTidyOptions?: string | false
  gtfsZipDisableHead?: boolean
}

export type ConfigurationFile = {
  regions: Record<Prefix, RegionConfig>
  database: {
    bucketName: string
    region: string
    publicUrl: string
  } | null
}

export type RegionResult = {
  regions: {
    region: Prefix
    etag: string
    size: number
    url: string
    shapesEtag?: string
    shapesSize?: number
    shapesUrl?: string
    bounds: [number, number][]
  }[]
  regionsConfig: Record<Prefix, RegionConfig>
}

export type VersionResult = {
  versions: {
    region: Prefix
    version: string
    date: string
    etag: string
    size: number
    url: string
    shapesEtag?: string
    shapesSize?: number
    shapesUrl?: string
  }[]
}
