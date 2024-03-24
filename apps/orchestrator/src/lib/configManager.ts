import { env } from '$env/dynamic/private'
import zlib from 'node:zlib'
import { parse } from 'yaml'

import type { Prefix } from '@lib/client'
import { DB } from '@lib/db'
import { Importer } from '@lib/importer'
import { type Logger, getErrorMessage } from '@lib/logger'

import sampleGtfs from '../static/sample-feed-1.bin.br?url'
import { BucketClient } from './bucketClient'

type RegionConfig = {
  name: string
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
      region: 'zz-sample1',
      etag: 'e699729a3825e2fcf048a63a6ef138de',
      size: 45056,
      url: sampleGtfs,
    },
  ],
}

const regionsUrlPrefix = 'regions/'

export class ConfigManager {
  #internalConfig: ConfigurationFile
  #bucketClient: BucketClient | null = null

  constructor() {
    try {
      this.#internalConfig = parse(env.WAKA_ORCHESTRATOR_CONFIG)
    } catch (err) {
      console.warn(err)
      console.warn('Could not read configuration file, using sample config.')
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
    regions: { region: string; etag: string; size: number; url: string }[]
  }> {
    if (this.#bucketClient === null) return { regions: sampleRegions.regions }
    const s3Objects = await this.#bucketClient.listObjects(regionsUrlPrefix)

    const regions = await Promise.all(
      (s3Objects.Contents || [])
        .filter((i) => i.Size || 0 > 0)
        .map(async (i) => {
          const data = await this.#bucketClient?.getObjectMetadata(i.Key!)
          return {
            region: (data?.Metadata || {})['waka-region'],
            etag: JSON.parse(i.ETag!),
            size: i.Size!,
            url: `${this.#internalConfig!.database!.publicUrl}/${i.Key!.substring(regionsUrlPrefix.length)}`,
          }
        })
    )
    return { regions }
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

    const db = new DB()
    const importer = new Importer({ db })
    const logger = importer.logger
    const logs: string[] = []
    await db.connect()
    logger.stream.set('') // prepares the logger
    const unsubscribeLogs = logger.stream.subscribe((i) =>
      i !== '' ? logs.push(`${new Date().toISOString()} ${i}`) : undefined
    )

    logger.info(`downloading gtfs headers from ${region.gtfsZipUrl}`)
    const resHead = await fetch(region.gtfsZipUrl, {
      headers: region.gtfsZipHeaders,
      method: 'HEAD',
    })
    if (!resHead.ok) {
      logs.push(`received http ${resHead.status} from upstream`)
      unsubscribeLogs()

      return {
        status: 'error',
        prefix,
        logs,
      }
    }
    logger.info(`gtfs headers download complete`)

    const key = `${regionsUrlPrefix}${prefix}.bin`
    const upstreamEtag = resHead.headers.get('ETag') || ''
    if (region.gtfsZipDisableEtag === true) {
      logger.info('skipping etag check')
    } else {
      const result = await this.checkUpstream(key, upstreamEtag, logger)
      if (result === false) {
        unsubscribeLogs()
        return { status: 'skipped', prefix, logs }
      }
    }

    try {
      logger.info(`downloading gtfs data from ${region.gtfsZipUrl}`)
      const resBody = await fetch(region.gtfsZipUrl, { headers: region.gtfsZipHeaders })
      if (!resHead.ok) throw new Error(`http: ${resBody.status}`)
      await importer.import(resBody.body!)
      const compressedFile = await this.compressFile(db.export(), logger)
      await this.uploadFile(key, compressedFile, prefix, upstreamEtag, logger)
      unsubscribeLogs()

      return {
        status: 'success',
        prefix,
        logs,
      }
    } catch (err) {
      unsubscribeLogs()
      logs.push(getErrorMessage(err))

      return {
        status: 'error',
        prefix,
        logs,
      }
    }
  }

  async checkUpstream(key: string, upstreamEtag: string, logger: Logger) {
    try {
      const existingMetadata = await this.#bucketClient!.getObjectMetadata(key)
      const existingEtag = existingMetadata.Metadata!['upstream-etag'] || ''
      if (upstreamEtag === existingEtag) {
        logger.info(
          `upstream gtfs content has not changed, skipping import (etag: ${upstreamEtag})`
        )
        return false
      } else {
        logger.info(`new gtfs data (etag: ${upstreamEtag})`)
      }
    } catch (err) {
      logger.info(`could not find an existing import`)
    }
    return true
  }

  async compressFile(data: Uint8Array, logger: Logger) {
    const quality = 5
    logger.info(`compressing database with brotli level ${quality}`)
    return zlib.brotliCompressSync(data, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: quality,
      },
    })
  }

  async uploadFile(
    key: string,
    data: Uint8Array,
    prefix: string,
    upstreamEtag: string,
    logger: Logger
  ) {
    logger.info(`uploading to s3 as ${key}`)
    await this.#bucketClient!.putObject(key, data, 'application/x-sqlite3', 'br', {
      'waka-region': prefix,
      'upstream-etag': upstreamEtag,
    })
    logger.info('upload to s3 complete')
  }
}
