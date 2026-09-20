import sqlite from 'node:sqlite'

import { logger } from '../logger'
import { IDatabase, parseGtfsDate } from './IDatabase'

export class NodeSqliteDB implements IDatabase {
  db?: sqlite.DatabaseSync

  async connect() {
    this.db = new sqlite.DatabaseSync(':memory:')
    logger.info('using node sqlite (native)')
  }

  reset() {
    this.db = new sqlite.DatabaseSync(':memory:')
  }

  load(data: ArrayBuffer) {
    this.db = new sqlite.DatabaseSync(':memory:')
    // @ts-expect-error added in node 24
    this.db.deserialize(new Uint8Array(data))
  }

  run(query: string) {
    if (!this.db) throw 'DB needs to be connected!'
    this.db.exec(query)
  }

  export() {
    if (!this.db) throw 'DB needs to be connected!'
    // @ts-expect-error added in node 24
    const buffer = this.db.serialize()
    return buffer
  }

  private exec(query: string, params?: string[]) {
    if (!this.db) throw 'DB needs to be connected!'
    const statement = this.db.prepare(query)
    return statement.all({}, ...(params || []))
  }

  execObject(query: string, params?: string[]) {
    const sqlResults = this.exec(query, params)
    if (sqlResults.length === 0) {
      return []
    }
    const results: Record<string, unknown>[] = sqlResults.map((row) => {
      return Object.keys(row).reduce((acc: Record<string, unknown>, cur: string) => {
        const columnName = cur
          .toLowerCase()
          .replace(/[-_][a-z]/g, (group: string) => group.slice(-1).toUpperCase())
        if (columnName.includes('Date')) {
          acc[columnName] = parseGtfsDate(row[cur] as string)
        } else {
          acc[columnName] = row[cur]
        }
        return acc
      }, {})
    })
    return results
  }
}
