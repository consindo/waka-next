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
  describe('getInfo', () => {
    it('should return feed info if feed_info does not exist', () => {
      const client = new Client()
      client.addRegion(region, db)
      const info = client.getInfo(region)
      expect(info).toEqual([{
        prefix: 'sample-region',
        feedLang: 'en',
        feedStartDate: new Date('2007-01-01'),
        feedEndDate: new Date('2010-12-31'),
      }])
    })
    it('should return feed info from table if it exists', () => {
      const client = new Client()
      client.addRegion(region, db)
      db.execObject(`CREATE TABLE feed_info (
        feed_publisher_name char,
        feed_publisher_url char,
        feed_lang char,
        default_lang char,
        feed_start_date char,
        feed_end_date char,
        feed_version char,
        feed_contact_email char,
        feed_contact_url char
      );
      INSERT INTO feed_info VALUES (
        'example',
        'example.com',
        'en',
        'en',
        '20000210',
        '20200210',
        '12344',
        'email@example.com',
        'example2.com'
      )
      `)
      const info = client.getInfo(region)
      expect(info).toEqual([{
        prefix: 'sample-region',
        feedLang: 'en',
        defaultLang: 'en',
        feedVersion: '12344',
        feedPublisherName: 'example',
        feedPublisherUrl: 'example.com',
        feedContactUrl: 'example2.com',
        feedContactEmail: 'email@example.com',
        feedStartDate: new Date('2000-02-10'),
        feedEndDate: new Date('2020-02-10'),
      }])
    })
  })
})
