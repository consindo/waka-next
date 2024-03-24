import fs from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'yaml'

import type { Prefix } from '@lib/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

type RegionConfig = {
  name: string
}

type ConfigurationFile = {
  regions: Record<Prefix, RegionConfig>
}

export class ConfigManager {
  #internalConfig: ConfigurationFile

  constructor() {
    try {
      const configData = fs.readFileSync(join(__dirname, '../../config.yaml')).toString()
      this.#internalConfig = parse(configData)
    } catch (err) {
      console.warn(err)
      console.warn('Could not read configuration file, using sample config.')
      this.#internalConfig = {
        regions: {
          'zz-sample1': {
            name: 'Sample Region',
          },
        },
      }
    }
  }
  getConfig() {
    return this.#internalConfig
  }
}
