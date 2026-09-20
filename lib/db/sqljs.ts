import sqlInit, { type Database } from 'sql.js'
import wasm from 'sql.js/dist/sql-wasm.wasm?url'

import { logger } from '../logger'
import { IDatabase, parseGtfsDate } from './IDatabase'

export class SqlJSDB implements IDatabase {
  db?: Database
  sql?: sqlInit.SqlJsStatic

  async connect() {
    this.sql = await sqlInit({
      locateFile: typeof window !== 'undefined' ? () => wasm : undefined,
    })
    this.db = new this.sql.Database()
    logger.info('using sql.js (wasm)')
  }

  reset() {
    if (!this.sql) throw 'DB needs to be connected!'
    this.db = new this.sql.Database()
  }

  load(data: ArrayBuffer) {
    if (!this.sql) throw 'DB needs to be connected!'
    this.db = new this.sql.Database(new Uint8Array(data))
  }

  run(query: string) {
    if (!this.db) throw 'DB needs to be connected!'
    this.db.run(query)
  }

  export() {
    if (!this.db) throw 'DB needs to be connected!'
    return this.db.export()
  }

  private exec(query: string, params?: string[]) {
    if (!this.db) throw 'DB needs to be connected!'
    return this.db.exec(query, params)
  }

  execObject(query: string, params?: string[]): Record<string, unknown>[] {
    const results = this.exec(query, params)
    return results.flatMap((result) => {
      const casedColumns = result.columns.map((i: string) =>
        i.toLowerCase().replace(/[-_][a-z]/g, (group: string) => group.slice(-1).toUpperCase())
      )
      return result.values.map((row) =>
        row.reduce((acc: Record<string, unknown>, cur: unknown, index: number) => {
          if (casedColumns[index].includes('Date')) {
            acc[casedColumns[index]] = parseGtfsDate(cur as string)
          } else {
            acc[casedColumns[index]] = cur
          }
          return acc
        }, {})
      )
    })
  }
}
