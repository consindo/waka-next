import { parse } from 'csv-parse/browser/esm/sync'
import type { DB } from '../db'
import { schema } from './schema'

export class DBImport {
  db: DB

  constructor(props: { db: DB }) {
    this.db = props.db
  }

  createTable = (table: string) => {
    const template = schema.find((i) => i.name === table)
    if (!template) throw `Could not find template for ${table}`

    const sqlColumns = Object.entries(template.schema).flatMap((i) => i.join(' '))
    this.db.run(`CREATE TABLE ${table} (${sqlColumns});`)
  }

  parseData = (table: string, columns: string[], data: string, batchSize = 10): string[] => {
    const rows = parse(data, { columns: true }) // this is a bit slow, could stream it instead
    const insertCommand = `INSERT INTO ${table} (${columns.join(',')})`

    const result = new Array(Math.ceil(rows.length / batchSize)).fill(null).map((_value, index) => {
      return rows
        .slice(index * batchSize, (index + 1) * batchSize)
        .map((row: { [key: string]: string }) => {
          const values = columns
            .map((key) => `'${(row[key] || '').split("'").join("''")}'`)
            .join(',')
          return `${insertCommand} VALUES (${values});`
        })
        .join('\n')
    })

    return result
  }

  importTable = (table: string, data: string) => {
    const template = schema.find((i) => i.name === table)
    if (!template) throw `Could not find template for ${table}`

    const columns = Object.keys(template.schema)
    const result = this.parseData(template.name, columns, data)

    result.forEach((batch) => {
      this.db.run(`BEGIN;${batch}COMMIT;`) // dramatically increases the speed of sqlite
    })
  }
}
