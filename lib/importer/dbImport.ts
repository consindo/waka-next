import type { DB } from '../db'
import { logger } from '../logger'
import { type Schema } from './schema'

export class DBImport {
  db: DB

  constructor(props: { db: DB }) {
    this.db = props.db
  }

  analyzeTable = (schema: Schema) => {
    const query = `ANALYZE ${schema.table};`
    this.db.run(query)
    logger.info(`(${schema.table}) analyzed table`)
  }

  createTable = (schema: Schema) => {
    const sqlColumns = Object.entries(schema.tableSchema)
      .flatMap((i) => i.join(' '))
      .join(', ')
    const query = `CREATE TABLE ${schema.table} (${sqlColumns}${schema.primaryKey.length > 0 ? `, PRIMARY KEY (${schema.primaryKey.join(', ')})` : ''});`
    this.db.run(query)
    logger.info(`(${schema.table}) created table`)
  }

  parseData = async (
    table: string,
    columns: string[],
    data: ReadableStream,
    batchSize = 10000
  ): Promise<string[]> => {
    const insertCommand = `INSERT INTO ${table} (${columns.join(',')})`

    let index = 0
    let batch = -1
    const output: string[] = []
    const reader = data.getReader()
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read() // async interables not supported yet
      if (done) break

      // batched in a string array
      value.data.forEach((row: string[]) => {
        if (index % batchSize === 0) {
          output.push('')
          batch++
        }
        const values = columns
          .map((key) =>
            row[value.schema[key]] ? `'${row[value.schema[key]].split("'").join("''")}'` : 'NULL'
          )
          .join(',')
        output[batch] += `${insertCommand} VALUES (${values});\n`

        index++
      })
    }
    return output
  }

  importTable = async (schema: Schema, data: ReadableStream) => {
    const columns = Object.keys(schema.tableSchema)
    const result = await this.parseData(schema.table, columns, data)

    // return
    result.forEach((batch, index) => {
      this.db.run(`BEGIN;${batch}COMMIT;`) // dramatically increases the speed of sqlite
      logger.info(`(${schema.table}) committed batch ${index + 1}/${result.length}`)
    })

    // run post import script
    if (schema.postImport) {
      this.db.run(schema.postImport)
      logger.info(`(${schema.table}) ran post import script`)
    }
  }
}
