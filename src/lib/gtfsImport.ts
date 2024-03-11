import type { DB } from "./db";

export class GTFSImport {
  db: DB;

  constructor(props: { db: DB }) {
    this.db = props.db
  }

  import = (table: string, data: string) => {
    const rows = data.split('\n')
    console.log(`${rows.length} total rows`)

    const sqlColumns = rows[0]
      .split(',')
      .map((i) => `${i} char`)
      .join(', ')
    this.db.run(`CREATE TABLE ${table} (${sqlColumns});`)

    const batchSize = 10000
    for (let i = 0; i < Math.ceil(rows.length / batchSize); i++) {
      if (i % 5 === 0) console.log(`batch ${i}`)
      const insertion = rows
        .slice(i * batchSize, (i + 1) * batchSize)
        .map((row, index) => {
          if (index === 0) return ''
          if (row.length === 0) return ''
          if (index % 50000 === 0) console.log(index)
          const values = row
            .split(',')
            .map((i) => `'${i.split("'").join("''")}'`)
            .join(',')
          return `INSERT INTO ${table} VALUES (${values});`
        })
        .join('\n')
      this.db.run(insertion)
    }
    console.log('import complete')
  }
}
