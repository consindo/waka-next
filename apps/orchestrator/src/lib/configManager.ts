import { ListObjectsCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { parse } from 'yaml'

import type { Prefix } from '@lib/client'

import configFile from '../config.yaml?url'
import sampleGtfs from '../static/sample-feed-1.bin.br?url'
import { read } from '$app/server'

type RegionConfig = {
  name: string
}

type ConfigurationFile = {
  regions: Record<Prefix, RegionConfig>
  database: {
    bucketName: string
    region: string
    publicUrl: string
  } | null
}

const sampleRegions = {
  config: {
    regions: {
      'zz-sample1': {
        name: 'Sample Region',
      },
    },
    database: null,
  },
  regions: [
    {
      region: 'zz-sample1',
      etag: 'e699729a3825e2fcf048a63a6ef138de',
      size: 45056,
      url: sampleGtfs
    }
  ]
}

export class ConfigManager {
  #internalConfig: ConfigurationFile | null = null
  #s3client: S3Client | null = null

  async loadConfig() {
    try {
      const configData = await read(configFile).text();
      this.#internalConfig = parse(configData)
    } catch (err) {
      console.warn(err)
      console.warn('Could not read configuration file, using sample config.')
      this.#internalConfig = sampleRegions.config
    }
    if (this.#internalConfig!.database) {
      this.#s3client = new S3Client({ region: this.#internalConfig!.database.region })
    }
  }
  
  async getRegions(): Promise<{ regions: { region: string; etag: string; size: number; url: string }[] }> {
    if (!this.#internalConfig) throw 'loadConfig needs to be run first'
    if (this.#s3client === null) return { regions: sampleRegions.regions }
    const { bucketName } = this.#internalConfig.database!
    const prefix = 'regions/'
    const command = new ListObjectsCommand({
      Bucket: bucketName,
      Prefix: prefix,
    })
    const s3Objects = await this.#s3client.send(command)

    const regions = (await Promise.all((s3Objects.Contents || [])
      .filter((i) => i.Size || 0 > 0)
      .map(async (i) => {
        const command = new HeadObjectCommand({ Bucket: bucketName, Key: i.Key })
        const data = await this.#s3client!.send(command)
        return {
          region: (data.Metadata || {})['waka-region'],
          etag: JSON.parse(i.ETag!),
          size: i.Size!,
          url: `${this.#internalConfig!.database!.publicUrl}/${i.Key!.substring(prefix.length)}`,
        }
      })
    ))
    return { regions }
  }
}
