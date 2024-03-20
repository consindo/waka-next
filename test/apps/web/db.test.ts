import { describe, it, expect, vi } from 'vitest'

import { DB } from '../../../apps/web/src/lib/db'
import { QueryExecResult, SqlValue } from 'sql.js'

describe('db', () => {
  describe('execObject', () => {
    it('should convert a raw sql result into an object format', async () => {
      const db = new DB()
      db.exec = vi.fn(
        () =>
          [
            {
              columns: ['a', 'b'],
              values: [
                [1, 2],
                [3, 4],
                [5, 6],
              ] as SqlValue[][],
            },
          ] as QueryExecResult[]
      )
      const result = db.execObject('fake query')
      expect(result).toEqual([
        { a: 1, b: 2 },
        { a: 3, b: 4 },
        { a: 5, b: 6 },
      ])
    })
    it('should combine multiple sql results into a single object', async () => {
      const db = new DB()
      db.exec = vi.fn(
        () =>
          [
            { columns: ['a', 'b'], values: [[1, 2]] as SqlValue[][] },
            { columns: ['c', 'd'], values: [[3, 4]] as SqlValue[][] },
          ] as QueryExecResult[]
      )
      const result = db.execObject('fake query')
      expect(result).toEqual([
        { a: 1, b: 2 },
        { c: 3, d: 4 },
      ])
    })
  })
})
