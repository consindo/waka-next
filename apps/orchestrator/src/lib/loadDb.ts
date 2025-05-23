import { read } from '$app/server'
import { exec } from 'child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'

import type { Client, Prefix } from '@lib/client'
import { DB } from '@lib/db'

import type { RegionResult } from './types'

export const loadDb = async (client: Client, regions: RegionResult) => {
  const { loadedVersions } = client

  // creates the local cache folder
  const cacheDir = 'cache'
  try {
    await fs.access(cacheDir)
  } catch {
    await fs.mkdir(cacheDir)
  }

  await Promise.all(
    regions.regions.map(async (region) => {
      const prefix = region.region as Prefix
      if (loadedVersions[prefix] === region.etag) {
        return // already loaded in
      }
      if (
        process.env.WAKA_ORCHESTRATOR_NO_CACHE ||
        regions.regionsConfig[prefix].shouldCache === false
      ) {
        console.log(`skipping cache of ${prefix}, shouldCache=false`)
        return
      }

      const localFilename = path.join(cacheDir, region.etag + '.bin')
      const data = await dlOrCache(`${prefix}.db`, localFilename, region.url)

      let shapesDir: string | undefined = undefined
      if (region.shapesUrl) {
        const shapesFilename = path.join(cacheDir, region.etag + '.shapes.tar.br')
        shapesDir = path.join(cacheDir, region.etag + '.shapes/')
        await dlOrCache(`${prefix}.shapes`, shapesFilename, region.shapesUrl)

        try {
          await fs.access(shapesDir)
        } catch {
          await fs.mkdir(shapesDir)

          try {
            // tar should already be decompressed with brotli
            await new Promise<void>((resolve, reject) => {
              exec(
                `tar -xf ${path.resolve(shapesFilename)} -C ${path.resolve(shapesDir!)}`,
                (err) => {
                  if (err) {
                    console.error(err)
                    return reject(err)
                  }
                  resolve()
                }
              )
            })
          } catch {
            console.log(`${shapesFilename} corrupt, deleting`)
            await fs.rm(path.resolve(shapesFilename))
          }
          console.log(`extracted ${prefix} shapes to cache`)
        }
      }

      // connect to db
      const db = new DB()
      await db.connect()
      db.load(data)

      // done
      client.addRegion(prefix, db, shapesDir)
      loadedVersions[prefix] = region.etag
      console.log(`loaded ${prefix} into memory db`)
    })
  )

  const shouldDelete = (name: string, extension: string) =>
    name.endsWith(extension) &&
    !Object.values(loadedVersions).includes(name.slice(0, extension.length * -1))

  const allFiles = await fs.readdir(cacheDir)
  const deletionCandidates = allFiles.filter(
    (i) =>
      shouldDelete(i, '.bin') || shouldDelete(i, '.shapes.tar.br') || shouldDelete(i, '.shapes')
  )
  for (const file of deletionCandidates) {
    await fs.rm(path.join(cacheDir, file), { recursive: true })
    console.log('deleted', file, 'from cache')
  }
}

const dlOrCache = async (id: string, localFilename: string, url: string) => {
  let data: ArrayBuffer
  try {
    await fs.access(localFilename)
    console.log(`loading ${id} locally from ${localFilename}`)
    data = (await fs.readFile(localFilename)) as unknown as ArrayBuffer
  } catch {
    console.log(`downloading ${id} from ${url}`)

    // download to local cache
    if (url.startsWith('/')) {
      const dataBr = await read(url).arrayBuffer()
      data = zlib.brotliDecompressSync(dataBr) as unknown as ArrayBuffer
    } else {
      const res = await fetch(url)
      data = await res.arrayBuffer()
    }

    // cache for later
    fs.writeFile(localFilename, Buffer.from(data)).then(() => {
      console.log(`saved ${id} to ${localFilename}`)
    })
  }
  return data
}
