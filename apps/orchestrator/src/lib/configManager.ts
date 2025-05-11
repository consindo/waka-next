import { env } from '$env/dynamic/private'
import { parseYAML } from 'confbox'

import type { Prefix } from '@lib/client'
import { convertFromTimezone } from '@lib/client/timezone'

import sampleGtfs from '../../static/sample-feed-1.bin.br?url'
import { BucketClient } from './bucketClient'
import { ImportManager } from './importManager'
import { replaceSecrets } from './replaceSecrets'
import type { ConfigurationFile, RegionResult, Version, VersionResult } from './types'

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
const dbSuffix = '.bin'
const shapesSuffix = '.shapes.tar.br'

export class ConfigManager {
  #internalConfig: ConfigurationFile
  #bucketClient: BucketClient | null = null

  constructor() {
    try {
      if (env.WAKA_ORCHESTRATOR_CONFIG === undefined)
        throw Error('ENV WAKA_ORCHESTRATOR_CONFIG not set')
      const secrets = parseYAML(env.WAKA_ORCHESTRATOR_SECRETS || '{}') as Record<string, string>
      const config = replaceSecrets(secrets, env.WAKA_ORCHESTRATOR_CONFIG || '')
      this.#internalConfig = parseYAML(config)
    } catch (err) {
      console.warn(err)
      console.warn('Could not read configuration, using sample config.')
      this.#internalConfig = sampleRegions.config
    }
    if (this.#internalConfig.database) {
      this.#bucketClient = new BucketClient(
        this.#internalConfig.database.bucketName,
        this.#internalConfig.database.region
      )
    }
  }

  async getRegions(): Promise<RegionResult> {
    if (this.#bucketClient === null)
      return { regions: sampleRegions.regions, regionsConfig: this.#internalConfig.regions }
    const s3Objects = await this.#bucketClient.listObjects(regionsUrlPrefix)

    const regions = await Promise.all(
      (s3Objects.Contents || []).flatMap(async (i) => {
        if (i.Key === undefined) throw new Error('s3 key was undefined')
        if (i.ETag === undefined) throw new Error('s3 etag was undefined')
        const data = await this.#bucketClient?.getObjectMetadata(i.Key)
        const region = (data?.Metadata || {})['waka-region'] as Prefix
        const bounds = (data?.Metadata || {})['waka-bounds'] as string
        if (this.#internalConfig.regions[region] === undefined) return []
        if (i.Size === 0) return [] // filters out folders
        if (i.Key?.endsWith(shapesSuffix)) return [] // filters out shape files
        const shapesKey = `${regionsUrlPrefix}${region}${shapesSuffix}`
        const shape = (s3Objects.Contents || []).find((i) => i.Key === shapesKey)

        if (!this.#internalConfig.database) throw new Error('internalConfig database undefined')
        return [
          {
            region,
            bounds: JSON.parse(bounds || '[[0,0],[0,0]]'),
            url: `${this.#internalConfig.database.publicUrl}/${i.Key}`,
            etag: JSON.parse(i.ETag),
            size: i.Size || 0,
            shapesUrl: shape
              ? `${this.#internalConfig.database.publicUrl}/${shape.Key}`
              : undefined,
            shapesEtag: shape ? JSON.parse(shape.ETag || '') : undefined,
            shapesSize: shape ? shape.Size || 0 : undefined,
          },
        ]
      })
    )
    return { regions: regions.flat(), regionsConfig: this.#internalConfig.regions }
  }

  async checkForUpdate(
    prefix: Prefix
  ): Promise<{ status: string; region: Prefix; logs: string[] }> {
    if (!this.#bucketClient) throw 'No database configured'
    const region = this.#internalConfig.regions[prefix]
    if (region === undefined) {
      return {
        status: 'not found',
        region: prefix,
        logs: [],
      }
    }
    const importManager = new ImportManager(
      prefix,
      this.#bucketClient,
      region.gtfsZipUrl,
      region.gtfsZipHeaders || {},
      region.gtfsZipDisableEtag || false,
      region.gtfsTidyOptions === undefined ? 'SCRmcsOeD' : region.gtfsTidyOptions,
      region.gtfsZipDisableHead || false
    )
    return importManager.checkAndDownloadUpdate()
  }

  async getVersions(prefix: Prefix): Promise<VersionResult> {
    if (this.#bucketClient === null) return { versions: [] }
    const keyPrefix = `${versionsUrlPrefix}${prefix}/`
    const s3Objects = await this.#bucketClient.listObjects(keyPrefix)
    const versions = (s3Objects.Contents || [])
      .filter((i) => i.Key?.endsWith(dbSuffix))
      .map((i) => {
        const version = (i.Key || '').slice(keyPrefix.length, -4)
        const shapesKey = `${keyPrefix}${version}${shapesSuffix}`
        const shape = (s3Objects.Contents || []).find((i) => i.Key === shapesKey)

        if (!i.LastModified) throw new Error('last modified not found')
        if (!i.ETag) throw new Error('etag not foun d')
        if (!this.#internalConfig.database) throw new Error('internalConfig database undefined')
        return {
          region: prefix,
          // remove the key, leading slash, and .bin
          version,
          date: i.LastModified.toISOString(),
          url: `${this.#internalConfig.database.publicUrl}/${i.Key}`,
          etag: JSON.parse(i.ETag),
          size: i.Size || 0,
          shapesUrl: shape ? `${this.#internalConfig.database.publicUrl}/${shape.Key}` : undefined,
          shapesEtag: shape ? JSON.parse(shape.ETag || '') : undefined,
          shapesSize: shape ? shape.Size || 0 : undefined,
        }
      })
    return { versions }
  }

  getConfiguredRegions() {
    return this.#internalConfig.regions
  }

  async setActiveVersion(prefix: Prefix, version: string) {
    const dbSourceKey = `${versionsUrlPrefix}${prefix}/${version}${dbSuffix}`
    const dbTargetKey = `${regionsUrlPrefix}${prefix}${dbSuffix}`
    const shapesSourceKey = `${versionsUrlPrefix}${prefix}/${version}${shapesSuffix}`
    const shapesTargetKey = `${regionsUrlPrefix}${prefix}${shapesSuffix}`
    if (!this.#bucketClient) throw new Error('no bucket client')
    await this.#bucketClient.copyObject(dbSourceKey, dbTargetKey)
    try {
      await this.#bucketClient.copyObject(shapesSourceKey, shapesTargetKey)
    } catch (err) {
      if (err instanceof Error && err.name === 'NoSuchKey') {
        console.log(`${version} does not have a ${shapesSuffix}`)
      } else {
        throw err
      }
    }
  }

  async determineLatestVersion(prefix: Prefix) {
    if (!this.#bucketClient) throw 'No database configured'
    const versions = await this.getVersions(prefix)
    const candidates = versions.versions.toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    let targetVersion: Version | null = null
    for (const version of candidates) {
      const dbSourceKey = `${versionsUrlPrefix}${prefix}/${version.version}${dbSuffix}`
      const metadata = await this.#bucketClient.getObjectMetadata(dbSourceKey)
      if (!metadata.Metadata) throw new Error('no metadata found')
      if (metadata.Metadata['waka-dates']) {
        const { feedStartDate, feedEndDate, feedTimezone } = JSON.parse(
          metadata.Metadata['waka-dates']
        )
        if (
          convertFromTimezone(feedTimezone, feedStartDate) < new Date() &&
          convertFromTimezone(feedTimezone, feedEndDate) > new Date()
        ) {
          targetVersion = version
          break
        }
      }
    }
    return targetVersion
  }
}
