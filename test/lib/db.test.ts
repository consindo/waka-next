import { QueryExecResult, SqlValue } from 'sql.js'
import { describe, expect, it, vi } from 'vitest'

import { DB } from '@lib/db'

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
    it('should convert columns with dates in the name to js date objects', async () => {
      const db = new DB()
      db.exec = vi.fn(
        () =>
          [
            {
              columns: ['a_date', 'b'],
              values: [['20021210', 2]] as SqlValue[][],
            },
          ] as QueryExecResult[]
      )
      const result = db.execObject('fake query')
      expect(result).toEqual([{ aDate: new Date(Date.parse('2002-12-10')), b: 2 }])
    })
  })
})
