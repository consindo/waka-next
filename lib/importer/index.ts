import { ZipReader } from '@zip.js/zip.js'

import type { DB } from '../db'
import { type Logger, logger } from '../logger'
import { CsvParser } from './csv'
import { DBImport } from './dbImport'
import { type Schema, schema } from './schema'
import { importShapes } from './shapes'

export class Importer {
  db: DB
  #dbImport: DBImport
  logger: Logger

  constructor(props: { db: DB }) {
    if (props?.db === undefined) throw 'requires db to be passed in'

    this.logger = logger
    this.db = props.db
    this.#dbImport = new DBImport({ db: props.db })
  }

  async import(
    stream: ReadableStream<Uint8Array>,
    schemas: Schema[] = schema,
    useShapesBlob = false
  ) {
    logger.info('reading zip')
    let shapesStream: ReadableStream | null = null
    const files = new ZipReader(stream)
    for await (const file of files.getEntriesGenerator()) {
      const schema = schemas.find((s) => s.filename === file.filename)
      if (schema === undefined || file.getData === undefined) {
        logger.info(`(skipping) ${file.filename}`)
        continue
      }

      // sets up our streams
      const decoder = new TextDecoderStream()
      const parser = new CsvParser()
      decoder.readable.pipeThrough(parser)
      file.getData(decoder)

      if (useShapesBlob === true && schema.table === 'shapes') {
        logger.info(`(shapes) skipping ${file.filename} sqlite - writing wkb`)
        shapesStream = parser.readable
        continue
      }

      this.#dbImport.createTable(schema)
      await this.#dbImport.importTable(schema, parser.readable)
    }

    let shapesBlob: Blob | null = null
    if (shapesStream) {
      logger.info('importing shapes to blob')
      shapesBlob = await importShapes(shapesStream)
    }

    logger.info('import complete')

    return {
      db: this.db,
      shapes: shapesBlob,
    }
  }
}
