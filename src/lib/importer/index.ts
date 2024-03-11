import type { DB } from '$lib/db'
import { DBImport } from './dbImport'

export class Importer {
  db: DB
  #dbImport: DBImport

  constructor(props: { db: DB }) {
    if (props?.db === undefined) throw 'requires db to be passed in'

    this.db = props.db
    this.#dbImport = new DBImport({ db: props.db })
  }

  async run() {
    const res = await fetch('/stops.txt')
    const data = await res.text()
    this.#dbImport.createTable('stops')
    console.time('import')
    this.#dbImport.importTable('stops', data)
    console.timeEnd('import')
    console.log('done!')
  }
}
