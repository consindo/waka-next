import { exec } from 'child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import asyncFs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { Readable } from 'stream'
import { finished } from 'stream/promises'
import { type ReadableStream as NodeWebReadableStream } from 'stream/web'

import { Client, type Prefix } from '@lib/client'
import { DB } from '@lib/db'
import { Importer } from '@lib/importer'
import { type Logger, getErrorMessage } from '@lib/logger'

import { type BucketClient } from './bucketClient'

const versionsUrlPrefix = 'versions/'

export class ImportManager {
  prefix: Prefix
  #bucketClient: BucketClient
  importUrl: string
  importHeaders: Record<string, string>
  disableEtag: boolean
  gtfsTidyOptions: string | false

  constructor(
    prefix: Prefix,
    bucketClient: BucketClient,
    importUrl: string,
    importHeaders: Record<string, string>,
    disableEtag: boolean,
    gtfsTidyOptions: string | false
  ) {
    this.prefix = prefix
    this.#bucketClient = bucketClient
    this.importUrl = importUrl
    this.importHeaders = importHeaders
    this.disableEtag = disableEtag
    this.gtfsTidyOptions = gtfsTidyOptions
  }

  async checkAndDownloadUpdate(): Promise<{ status: string; prefix: Prefix; logs: string[] }> {
    const prefix = this.prefix
    const db = new DB()
    const importer = new Importer({ db })
    await db.connect()

    // prepares the logger
    const logger = importer.logger
    const logs: string[] = []
    logger.stream.set('')
    const unsubscribeLogs = logger.stream.subscribe((i) =>
      i !== '' ? logs.push(`${new Date().toISOString()} ${i}`) : undefined
    )

    let upstreamEtag: string
    try {
      const res = await this.downloadGtfs('HEAD', logger)
      upstreamEtag = res.headers.get('ETag') || ''
    } catch (err) {
      unsubscribeLogs()
      return { status: 'error', prefix, logs }
    }
    logger.info(`gtfs headers download complete`)

    const hash = crypto.createHash('md5').update(upstreamEtag).digest('hex')
    const dbKey = `${versionsUrlPrefix}${prefix}/${hash}.bin`
    const shapesKey = `${versionsUrlPrefix}${prefix}/${hash}.shapes.tar.br`
    if (this.disableEtag === true) {
      logger.info('skipping etag check')
    } else {
      const result = await this.checkExistingVersion(dbKey, upstreamEtag, logger, hash)
      if (result === false) {
        unsubscribeLogs()
        return { status: 'skipped', prefix, logs }
      }
    }

    try {
      const res = await this.downloadGtfs('GET', logger)
      let tidiedGtfs = res.body!
      if (this.gtfsTidyOptions !== false) {
        tidiedGtfs = await this.tidyGtfs(prefix, res, logger)
      }
      const importedFiles = await importer.import(tidiedGtfs, undefined, true)
      const client = new Client()
      client.addRegion(prefix, db)
      const bounds = client.getBounds(prefix)[0].bounds
      const dbExport = db.export()
      const shapesExport = await importedFiles.shapes!.arrayBuffer()
      const compressedDb = await this.compressFile(dbExport, logger)
      const compressedShapes = await this.compressFile(shapesExport, logger)
      await this.uploadFile(dbKey, compressedDb, prefix, upstreamEtag, bounds, logger)
      await this.uploadFile(shapesKey, compressedShapes, prefix, upstreamEtag, bounds, logger)
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

  async downloadGtfs(method: 'GET' | 'HEAD', logger: Logger) {
    logger.info(`requesting ${method} gtfs from ${this.importUrl}`)
    const res = await fetch(this.importUrl, {
      headers: this.importHeaders,
      method,
    })
    if (!res.ok) {
      logger.info(`received http ${res.status} from upstream`)
      throw new Error(`http: ${res.status}`)
    }
    return res
  }

  async checkExistingVersion(key: string, upstreamEtag: string, logger: Logger, hash: string) {
    try {
      const existingMetadata = await this.#bucketClient!.getObjectMetadata(key)
      const existingEtag = existingMetadata.Metadata!['upstream-etag'] || ''
      if (upstreamEtag === existingEtag) {
        logger.info(`upstream gtfs content has not changed, skipping import`)
        logger.info(`(version: ${hash}, upstream-etag: ${upstreamEtag})`)
        return false
      }
    } catch (err) {
      logger.info(`no existing import found at ${key}`)
    }
    logger.info(`new etag (etag: ${upstreamEtag})`)
    return true
  }

  async compressFile(data: zlib.InputType, logger: Logger) {
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
    bounds: [[number, number], [number, number]],
    logger: Logger
  ) {
    logger.info(`uploading to s3 as ${key}`)
    await this.#bucketClient!.putObject(key, data, 'application/x-sqlite3', 'br', {
      'waka-region': prefix,
      'waka-bounds': JSON.stringify(bounds),
      'upstream-etag': upstreamEtag,
    })
    logger.info('upload to s3 complete')
  }

  async tidyGtfs(name: string, res: Response, logger: Logger) {
    // creates the local cache folder
    const cacheDir = 'cache'
    try {
      await asyncFs.access(cacheDir)
    } catch (err) {
      await asyncFs.mkdir(cacheDir)
    }

    logger.info('starting tidy of gtfs data')

    const filename = path.join(cacheDir, `${name}.zip`)
    const optimizedFilename = path.join(cacheDir, `${name}.optimized.zip`)
    const fileStream = fs.createWriteStream(filename, { flags: 'w' }) // overwrite any existing file
    await finished(Readable.fromWeb(res.body as NodeWebReadableStream<Uint8Array>).pipe(fileStream))

    logger.info(`invoking gtfstidy -${this.gtfsTidyOptions}`)
    let finalFile: string
    try {
      await new Promise<void>((resolve, reject) => {
        exec(
          `gtfstidy -${this.gtfsTidyOptions} ${filename} --zip-compression-level 0 -o ${optimizedFilename}`,
          (err, stdout, stderror) => {
            if (err) {
              logger.error(stderror.trim())
              logger.error(JSON.stringify(err))
              return reject()
            }
            logger.info(stdout.trim())
            resolve()
          }
        )
      })
      finalFile = optimizedFilename
    } catch {
      finalFile = filename
    }

    const stream = fs.createReadStream(finalFile)
    return Readable.toWeb(stream) as ReadableStream<Uint8Array>
  }
}
