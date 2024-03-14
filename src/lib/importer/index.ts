import { ZipReader } from '@zip.js/zip.js'

import type { DB } from '$lib/db'
import { logger } from '$lib/logger'

import { CsvParser } from './csv'
import { DBImport } from './dbImport'
import { schema, type Schema } from './schema'

export class Importer {
  db: DB
  #dbImport: DBImport

  constructor(props: { db: DB }) {
    if (props?.db === undefined) throw 'requires db to be passed in'

    this.db = props.db
    this.#dbImport = new DBImport({ db: props.db })
  }

  async import(stream: ReadableStream<Uint8Array>, schemas: Schema[] = schema) {
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

      this.#dbImport.createTable(schema)
      await this.#dbImport.importTable(schema, parser.readable)
    }
  }
}
