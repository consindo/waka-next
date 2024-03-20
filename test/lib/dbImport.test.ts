import { describe, it, expect, vi } from 'vitest'

import { DB } from '../../lib/db'
import { DBImport } from '../../lib/importer/dbImport'
import { schema } from '../../lib/importer/schema'

describe('dbImport', () => {
  describe('createTable', () => {
    it('should create a table', () => {
      const db = new DB()
      db.run = vi.fn()
      const dbImport = new DBImport({ db })
      const table = schema.find((i) => i.table === 'calendar_dates')
      expect(table).not.toBe(undefined)

      dbImport.createTable(table!)
      expect(db.run).toBeCalledWith(
        'CREATE TABLE calendar_dates (service_id CHAR, date CHAR, exception_type INTEGER);'
      )
    })
  })
})
