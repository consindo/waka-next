import sqlInit, { type Database, type SqlValue } from 'sql.js'
import wasm from 'sql.js/dist/sql-wasm.wasm?url'

export class DB {
  db?: Database
  sql?: sqlInit.SqlJsStatic

  async connect() {
    this.sql = await sqlInit({
      locateFile: typeof window !== 'undefined' ? () => wasm : undefined,
    })
    this.db = new this.sql.Database()
  }

  reset() {
    if (!this.sql) throw 'DB needs to be connected!'
    this.db = new this.sql.Database()
  }

  load(data: ArrayBuffer) {
    if (!this.sql) throw 'DB needs to be connected!'
    this.db = new this.sql.Database(new Uint8Array(data))
  }

  exec(query: string, params?: string[]) {
    if (!this.db) throw 'DB needs to be connected!'
    const results = this.db.exec(query, params)
    return results
  }

  run(query: string) {
    if (!this.db) throw 'DB needs to be connected!'
    this.db.run(query)
  }

  export() {
    if (!this.db) throw 'DB needs to be connected!'
    return this.db.export()
  }

  execObject(query: string, params?: string[]) {
    const results = this.exec(query, params)
    return results.flatMap((result) => {
      const casedColumns = result.columns.map((i: string) =>
        i.toLowerCase().replace(/[-_][a-z]/g, (group: string) => group.slice(-1).toUpperCase())
      )
      return result.values.map((row) =>
        row.reduce((acc: Record<string, unknown>, cur: SqlValue, index: number) => {
          acc[casedColumns[index]] = cur
          return acc
        }, {})
      )
    })
  }
}
