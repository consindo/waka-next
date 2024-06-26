import { describe, expect, it } from 'vitest'

import { CsvParser } from '@lib/importer/csv'

describe('importer/csv', () => {
  describe('CsvParser', () => {
    it('should parse a text stream into a csv format', async () => {
      const parser = new CsvParser()

      const writer = parser.writable.getWriter()
      writer.write('col1,col2,col3\na,b,c\n')
      writer.write('d,e,f\ng,')
      writer.write('h,i')
      writer.close()

      const reader = parser.readable.getReader()
      const result: string[] = []
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result.push(...value.data)
        expect(value.schema).toEqual({ col1: 0, col2: 1, col3: 2 })
      }
      expect(result).toEqual([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i'],
      ])
    })
    it('should parse a csv with only a header line', async () => {
      const parser = new CsvParser()

      const writer = parser.writable.getWriter()
      writer.write('col1,col2,col3')
      writer.close()

      const reader = parser.readable.getReader()
      const result: string[] = []
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result.push(...value.data)
        expect(value.schema).toEqual({ col1: 0, col2: 1, col3: 2 })
      }
      expect(result).toEqual([])
    })
  })
})
