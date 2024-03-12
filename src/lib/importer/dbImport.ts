import { parse } from 'csv-parse/browser/esm/sync'

import type { DB } from '$lib/db'
import { logger } from '$lib/logger'

import { type Schema } from './schema'

export class DBImport {
  db: DB

  constructor(props: { db: DB }) {
    this.db = props.db
  }

  createTable = (schema: Schema) => {
    const sqlColumns = Object.entries(schema.tableSchema).flatMap((i) => i.join(' '))
    this.db.run(`CREATE TABLE ${schema.table} (${sqlColumns});`)
    logger.info(`[${schema.table}]: created table`)
  }

  parseData = (table: string, columns: string[], data: string, batchSize = 10000): string[] => {
    const rows = parse(data, { columns: true }) // this is a bit slow, could stream it instead
    const insertCommand = `INSERT INTO ${table} (${columns.join(',')})`

    const result = new Array(Math.ceil(rows.length / batchSize)).fill(null).map((_value, index) => {
      return rows
        .slice(index * batchSize, (index + 1) * batchSize)
        .map((row: { [key: string]: string }) => {
          const values = columns
            .map((key) => (row[key] ? `'${row[key].split("'").join("''")}'` : 'NULL'))
            .join(',')
          return `${insertCommand} VALUES (${values});`
        })
        .join('\n')
    })

    logger.info(`[${table}]: parsed csv`)
    return result
  }

  importTable = (schema: Schema, data: string) => {
    const columns = Object.keys(schema.tableSchema)
    const result = this.parseData(schema.table, columns, data)

    result.forEach((batch, index) => {
      this.db.run(`BEGIN;${batch}COMMIT;`) // dramatically increases the speed of sqlite
      logger.info(`[${schema.table}]: committed batch ${index + 1}/${result.length}`)
    })
  }
}
