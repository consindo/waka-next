import wasm from 'sql.js/dist/sql-wasm.wasm?url'
import sqlInit, { type Database } from 'sql.js'

export class DB {
  db?: Database
  sql?: sqlInit.SqlJsStatic

  async connect() {
    this.sql = await sqlInit({
      locateFile: () => wasm
    })
    this.db = new this.sql.Database()
  }

  load(data: ArrayBuffer) {
    if (!this.sql) throw 'DB needs to be connected!'
    this.db = new this.sql.Database(new Uint8Array(data))
  }

  exec(query: string) {
    if (!this.db) throw 'DB needs to be connected!'
    const results = this.db.exec(query)
    results.forEach(result => {
      console.table([result.columns, ...result.values])
    })
    return results
  }

  run(query: string) {
    if (!this.db) throw 'DB needs to be connected!'
    this.db.run(query)
  }
}
