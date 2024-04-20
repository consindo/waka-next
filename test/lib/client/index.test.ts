import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { beforeAll, describe, expect, it } from 'vitest'

import { Client } from '@lib/client'
import { DB } from '@lib/db'

const db = new DB()
const region = 'sample-region'
const sampleFeed = path.join(__dirname, '../../../apps/orchestrator/static/sample-feed-1.bin.br')

describe('client', () => {
  beforeAll(async () => {
    await db.connect()
    const compressedFeed = await fs.readFile(sampleFeed)
    const feed = zlib.brotliDecompressSync(compressedFeed)
    db.load(feed)
  })
  describe('runQuery', () => {
    it('should run queries on all databases', () => {
      const client = new Client()
      client.addRegion(region, db)
      client.addRegion('sample-region2', db)
      const result = client.runQuery('all', 'select 1 as number') as {
        number: number
        prefix: string
      }[]
      expect(result.length).toEqual(2)
      expect(result[0]).toEqual({ number: 1, prefix: region })
      expect(result[1]).toEqual({ number: 1, prefix: 'sample-region2' })
    })
    it('should throw an error if the region does not exist', () => {
      const client = new Client()
      client.addRegion(region, db)
      expect(() => client.runQuery('region-2', 'select 1 as number')).toThrowError(
        'REGION_NOT_FOUND'
      )
    })
  })
  describe('getBounds', () => {
    it('should return bounds for a feed', () => {
      const client = new Client()
      client.addRegion(region, db)
      const bounds = client.getBounds(region)
      expect(bounds[0].bounds).toEqual([
        [-116.40094, 36.915684],
        [-117.13316, 36.42529],
      ])
    })
  })
})
