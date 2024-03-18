import { inferSchema, initParser, type BaseParse, type Parser, type SchemaColumn } from 'udsv'

const transformContent = () => {
  type CsvSchema = { [key: string]: number }
  let parser: Parser | null = null
  let schema: CsvSchema

  return {
    start() {}, // required.
    async transform(chunkPromise: Promise<string>, controller: TransformStreamDefaultController) {
      const chunk = await chunkPromise
      if (parser === null) {
        let csvSchema
        try {
          csvSchema = inferSchema(chunk)
        } catch {
          // it crashes if the csv header row doesn't have a newline
          csvSchema = inferSchema(chunk + '\n') 
        }
        parser = initParser(csvSchema)
        schema = csvSchema.cols.reduce((acc: CsvSchema, cur: SchemaColumn, index: number) => {
          acc[cur.name] = index
          return acc
        }, {})
      }

      parser.chunk(chunk, parser.stringArrs as BaseParse<string>, (data) => {
        controller.enqueue({ schema, data })
      })
    },
    flush() {
      parser!.end()
    },
  }
}

export class CsvParser extends TransformStream {
  constructor() {
    super({ ...transformContent() })
  }
}
