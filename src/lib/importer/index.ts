import type { DB } from '$lib/db'
import { DBImport } from './dbImport'
import { BlobReader, TextWriter, ZipReader, type Entry } from '@zip.js/zip.js'
import { schema, type Schema } from './schema'

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
    const blob = await res.blob()
    return blob
  }

  async unzip(zipBlob: Blob): Promise<Entry[]> {
    const zipFileReader = new BlobReader(zipBlob)
    const zipReader = new ZipReader(zipFileReader)
    const entries = await zipReader.getEntries()
    return entries
  }

  async import(files: Entry[], schemas: Schema[]) {
    for (let schema of schemas) {
      const file = files.find((f) => f.filename === schema.filename)
      if (file == undefined || file.getData === undefined) {
        throw `${schema.filename} not found in archive`
      }

      const data = await file.getData(new TextWriter())
      this.#dbImport.createTable(schema)
      this.#dbImport.importTable(schema, data)
    }
  }

  async run() {
    console.time('fetch')
    const zipBlob = await this.download()
    console.timeEnd('fetch')

    console.time('unzip')
    const gtfsFiles = await this.unzip(zipBlob)
    console.timeEnd('unzip')

    console.time('import')
    await this.import(gtfsFiles, schema)
    console.timeEnd('import')
    console.log('done!')
  }
}
