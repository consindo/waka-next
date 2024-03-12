import type { DB } from '$lib/db'
import { DBImport } from './dbImport'
import { ZipReader } from '@zip.js/zip.js'
import { schema, type Schema } from './schema'
import { CsvParser } from './csv'

export class Importer {
  db: DB
  #dbImport: DBImport

  constructor(props: { db: DB }) {
    if (props?.db === undefined) throw 'requires db to be passed in'

    this.db = props.db
    this.#dbImport = new DBImport({ db: props.db })
  }

  async download() {
    const res = await fetch('/gtfs.zip')
    if (res.body === null) throw 'download failed'
    return new ZipReader(res.body)
  }

  async import(files: ZipReader<unknown>, schemas: Schema[]) {
    for await (const file of files.getEntriesGenerator()) {
      const schema = schemas.find((s) => s.filename === file.filename)
      if (schema === undefined || file.getData === undefined) {
        console.log('skipping', file.filename)
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

  async run() {
    console.time('fetch')
    const gtfsZip = await this.download()
    console.timeEnd('fetch')

    console.time('import')
    await this.import(gtfsZip, schema)
    console.timeEnd('import')
    console.log('done!')
  }
}
