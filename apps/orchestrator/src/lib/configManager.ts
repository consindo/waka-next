import { env } from '$env/dynamic/private'
import { parse } from 'yaml'

import type { Prefix } from '@lib/client'

import sampleGtfs from '../../static/sample-feed-1.bin.br?url'
import { BucketClient } from './bucketClient'
import { ImportManager } from './importManager'

type RegionConfig = {
  name: string
  shouldCache?: boolean
  gtfsZipUrl: string
  gtfsZipHeaders?: Record<string, string>
  gtfsZipDisableEtag?: boolean
}

type ConfigurationFile = {
  regions: Record<Prefix, RegionConfig>
  database: {
    bucketName: string
    region: string
    publicUrl: string
  } | null
}

const sampleRegions = {
  config: {
    regions: {
      'zz-sample1': {
        name: 'Sample Region',
        gtfsZipUrl: 'https://next.waka.app/sample-feed-1.zip', // apps/web
      },
    },
    database: null,
  },
  regions: [
    {
      region: 'zz-sample1' as Prefix,
      etag: 'e699729a3825e2fcf048a63a6ef138de',
      bounds: [
        [-116.40094, 36.915684],
        [-117.13316, 36.42529],
      ] as [number, number][],
      size: 2323,
      url: sampleGtfs,
    },
  ],
}

const regionsUrlPrefix = 'regions/'
const versionsUrlPrefix = 'versions/'

export class ConfigManager {
  #internalConfig: ConfigurationFile
  #bucketClient: BucketClient | null = null

  constructor() {
    try {
      if (env.WAKA_ORCHESTRATOR_CONFIG === undefined)
        throw Error('ENV WAKA_ORCHESTRATOR_CONFIG not set')
      this.#internalConfig = parse(env.WAKA_ORCHESTRATOR_CONFIG)
    } catch (err) {
      console.warn(err)
      console.warn('Could not read configuration, using sample config.')
      this.#internalConfig = sampleRegions.config
    }
    if (this.#internalConfig!.database) {
      this.#bucketClient = new BucketClient(
        this.#internalConfig!.database.bucketName,
        this.#internalConfig!.database.region
      )
    }
  }

  async getRegions(): Promise<{
    regions: {
      region: Prefix
      etag: string
      size: number
      url: string
      bounds: [number, number][]
    }[]
    regionsConfig: Record<Prefix, RegionConfig>
  }> {
    if (this.#bucketClient === null)
      return { regions: sampleRegions.regions, regionsConfig: this.#internalConfig.regions }
    const s3Objects = await this.#bucketClient.listObjects(regionsUrlPrefix)

    const regions = await Promise.all(
      (s3Objects.Contents || []).flatMap(async (i) => {
        const data = await this.#bucketClient?.getObjectMetadata(i.Key!)
        const region = (data?.Metadata || {})['waka-region'] as Prefix
        const bounds = (data?.Metadata || {})['waka-bounds'] as string
        if (this.#internalConfig.regions[region] === undefined) return []
        if (i.Size === 0) return [] // filters out folders
        return [
          {
            region,
            etag: JSON.parse(i.ETag!),
            bounds: JSON.parse(bounds || '[[0,0],[0,0]]'),
            size: i.Size || 0,
            url: `${this.#internalConfig!.database!.publicUrl}/${i.Key}`,
          },
        ]
      })
    )
    return { regions: regions.flat(), regionsConfig: this.#internalConfig.regions }
  }

  async checkForUpdate(
    prefix: Prefix
  ): Promise<{ status: string; prefix: Prefix; logs: string[] }> {
    if (!this.#bucketClient) throw 'No database configured'
    const region = this.#internalConfig.regions[prefix]
    if (region === undefined) {
      return {
        status: 'not found',
        prefix,
        logs: [],
      }
    }
    const importManager = new ImportManager(
      prefix,
      this.#bucketClient,
      region.gtfsZipUrl,
      region.gtfsZipHeaders || {},
      region.gtfsZipDisableEtag || false
    )
    return importManager.checkAndDownloadUpdate()
  }

  async getVersions(prefix: Prefix) {
    if (this.#bucketClient === null) return { versions: [] }
    const keyPrefix = versionsUrlPrefix + prefix
    const s3Objects = await this.#bucketClient.listObjects(keyPrefix)
    const versions = (s3Objects.Contents || []).map((i) => {
      return {
        prefix,
        // remove the key, leading slash, and .bin
        version: (i.Key || '').slice(keyPrefix.length + 1, -4),
        date: i.LastModified?.toISOString(),
        url: `${this.#internalConfig!.database!.publicUrl}/${i.Key}`,
        etag: JSON.parse(i.ETag!),
        size: i.Size || 0,
      }
    })
    return { versions }
  }

  getConfiguredRegions() {
    return this.#internalConfig.regions
  }

  async setActiveVersion(prefix: Prefix, version: string) {
    const sourceKey = `${versionsUrlPrefix}${prefix}/${version}.bin`
    const targetKey = `${regionsUrlPrefix}${prefix}.bin`
    await this.#bucketClient!.copyObject(sourceKey, targetKey)
  }
}
