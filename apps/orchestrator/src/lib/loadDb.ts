import { read } from '$app/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'

import type { Client, Prefix } from '@lib/client'
import { DB } from '@lib/db'

import type { RegionResult } from './configManager'

const loadedVersions: Record<Prefix, string> = {}

export const loadDb = async (client: Client, regions: RegionResult) => {
  // creates the local cache folder
  const cacheDir = 'cache'
  try {
    await fs.access(cacheDir)
  } catch (err) {
    await fs.mkdir(cacheDir)
  }

  await Promise.all(
    regions.regions.map(async (region) => {
      const prefix = region.region as Prefix
      if (loadedVersions[prefix] === region.etag) {
        return // already loaded in
      }
      if (regions.regionsConfig[prefix].shouldCache === false) {
        console.log(`skipping cache of ${prefix}, shouldCache=false`)
        return
      }

      let data: ArrayBuffer
      const localFilename = path.join(cacheDir, region.etag + '.bin')
      try {
        await fs.access(localFilename)
        console.log(`loading ${prefix} locally from ${localFilename}`)
        data = await fs.readFile(localFilename)
      } catch (err) {
        console.log(`downloading ${prefix} from ${region.url}`)

        // download to local cache
        if (region.url.startsWith('/')) {
          const dataBr = await read(region.url).arrayBuffer()
          data = zlib.brotliDecompressSync(dataBr)
        } else {
          const res = await fetch(region.url)
          data = await res.arrayBuffer()
        }

        // cache for later
        fs.writeFile(localFilename, Buffer.from(data)).then(() => {
          console.log(`saved ${prefix} to ${localFilename}`)
        })
      }

      // connect to db
      const db = new DB()
      await db.connect()
      db.load(data)

      // done
      client.addRegion(prefix, db)
      loadedVersions[prefix] = region.etag
      console.log(`loaded ${prefix} into memory db`)
    })
  )

  const allFiles = await fs.readdir(cacheDir)
  const deletionCandidates = allFiles.filter(
    (i) => i.endsWith('.bin') && !Object.values(loadedVersions).includes(i.slice(0, -4))
  )
  for (const file of deletionCandidates) {
    console.log('deleted', file, 'from cache')
    await fs.rm(path.join(cacheDir, file))
  }
}
