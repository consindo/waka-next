import wasm from 'sql.js/dist/sql-wasm.wasm?url'
import sqlInit, { type Database } from 'sql.js'

export class DB {
  db?: Database

  async connect() {
    const sql = await sqlInit({
      locateFile: () => wasm
    })
    this.db = new sql.Database()
  }

  exec(query: string) {
    if (!this.db) throw 'DB needs to be connected!'
    const results = this.db.exec(query)
    results.forEach(result => {
      console.table([result.columns, ...result.values])
    })
    return results
  }
}
