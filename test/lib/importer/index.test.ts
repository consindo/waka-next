import fs from 'node:fs'
import path from 'node:path'
import stream from 'node:stream'
import { describe, expect, it } from 'vitest'

import { DB } from '@lib/db'
import { Importer } from '@lib/importer'

const sampleFeed = path.join(__dirname, '../../../apps/web/static/sample-feed-1.zip')

describe('importer', () => {
  describe('import', () => {
    it('should import a zipped gtfs file', async () => {
      const db = new DB()
      await db.connect()
      const importer = new Importer({ db })
      const file = fs.createReadStream(sampleFeed)
      const result = await importer.import(
        stream.Readable.toWeb(file) as ReadableStream<Uint8Array>
      )
      expect(result.shapes).toEqual(null)
      const smokeTest = db.exec('select count(*) from stops')
      expect(smokeTest[0].values[0]).toEqual([9])
      const smokeTest2 = db.exec('select count(*) from shapes')
      expect(smokeTest2[0].values[0]).toEqual([4])
    })
    it('should import a zipped gtfs file and include shapes seperately', async () => {
      const db = new DB()
      await db.connect()
      const importer = new Importer({ db })
      const file = fs.createReadStream(sampleFeed)
      const result = await importer.import(
        stream.Readable.toWeb(file) as ReadableStream<Uint8Array>,
        undefined,
        true
      )
      expect(() => db.exec('select count(*) from shapes')).toThrowError()
      expect(result.shapes).not.toEqual(null)
    })
  })
})
