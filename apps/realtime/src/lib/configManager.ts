import { env } from '$env/dynamic/private'
import { parseYAML } from 'confbox'

export const replaceSecrets = (secrets: Record<string, string>, config: string) => {
  Object.keys(secrets).forEach((secretKey) => {
    const secret = secrets[secretKey]
    config = config.split(`SECRET.${secretKey}`).join(secret)
  })
  return config
}

export interface RealtimeRegionConfig {
  pullInterval?: number
  gtfsRtTripUpdatesUrl?: string
  gtfsRtServiceAlertsUrl?: string
  gtfsRtVehicleLocationsUrl?: string
  gtfsRtHeaders?: Record<string, string>
}

interface RealtimeConfigurationFile {
  regions: Record<string, RealtimeRegionConfig>
}

export class RealtimeConfigManager {
  #internalConfig: RealtimeConfigurationFile

  constructor() {
    if (env.WAKA_REALTIME_CONFIG === undefined) throw Error('ENV WAKA_REALTIME_CONFIG not set')
    try {
      const secrets = parseYAML(env.WAKA_REALTIME_SECRETS || '{}') as Record<string, string>
      const config = replaceSecrets(secrets, env.WAKA_REALTIME_CONFIG || '')
      this.#internalConfig = parseYAML(config)
    } catch {
      throw Error('WAKA_REALTIME_CONFIG or WAKA_REALTIME_SECRETS was malformed')
    }
  }

  getRegions() {
    return this.#internalConfig.regions
  }
}
