import { type BaseParse, type Parser, type SchemaColumn, inferSchema, initParser } from 'udsv'

const transformContent = () => {
  let parser: Parser | null = null
  let schema: Record<string, number>

  return {
    start() {
      return
    }, // required.
    async transform(chunkPromise: Promise<string>, controller: TransformStreamDefaultController) {
      let chunk = await chunkPromise
      if (parser === null) {
        let csvSchema
        try {
          csvSchema = inferSchema(chunk)
        } catch {
          // it crashes if the csv header row doesn't have a newline
          chunk = chunk + '\n'
          csvSchema = inferSchema(chunk)
        }
        parser = initParser(csvSchema)
        schema = csvSchema.cols.reduce(
          (acc: Record<string, number>, cur: SchemaColumn, index: number) => {
            acc[cur.name] = index
            return acc
          },
          {}
        )
      }

      parser.chunk(chunk, parser.stringArrs as BaseParse<string>, (data) => {
        controller.enqueue({ schema, data: [data] })
      })
    },
    flush() {
      if (parser) parser.end()
    },
  }
}

export class CsvParser extends TransformStream {
  constructor() {
    super({ ...transformContent() })
  }
}
