import zlib from 'node:zlib'

import type { Prefix } from '@lib/client'
import { DB } from '@lib/db'
import { Importer } from '@lib/importer'
import { type Logger, getErrorMessage } from '@lib/logger'

import { type BucketClient } from './bucketClient'

const regionsUrlPrefix = 'regions/'

export class ImportManager {
  prefix: Prefix
  #bucketClient: BucketClient
  importUrl: string
  importHeaders: Record<string, string>
  disableEtag: boolean

  constructor(
    prefix: Prefix,
    bucketClient: BucketClient,
    importUrl: string,
    importHeaders: Record<string, string>,
    disableEtag: boolean
  ) {
    this.prefix = prefix
    this.#bucketClient = bucketClient
    this.importUrl = importUrl
    this.importHeaders = importHeaders
    this.disableEtag = disableEtag
  }

  async checkAndDownloadUpdate(): Promise<{ status: string; prefix: Prefix; logs: string[] }> {
    const prefix = this.prefix
    const db = new DB()
    const importer = new Importer({ db })
    const logger = importer.logger
    const logs: string[] = []
    await db.connect()
    logger.stream.set('') // prepares the logger
    const unsubscribeLogs = logger.stream.subscribe((i) =>
      i !== '' ? logs.push(`${new Date().toISOString()} ${i}`) : undefined
    )

    logger.info(`downloading gtfs headers from ${this.importUrl}`)
    const resHead = await fetch(this.importUrl, {
      headers: this.importHeaders,
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
    if (this.disableEtag === true) {
      logger.info('skipping etag check')
    } else {
      const result = await this.checkUpstream(key, upstreamEtag, logger)
      if (result === false) {
        unsubscribeLogs()
        return { status: 'skipped', prefix, logs }
      }
    }

    try {
      logger.info(`downloading gtfs data from ${this.importUrl}`)
      const resBody = await fetch(this.importUrl, { headers: this.importHeaders })
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
