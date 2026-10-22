import { defineEnvVars } from '@sveltejs/kit/env'

// @migration-task Review usage of dynamic environment variables. They fall back to the empty string if not present, which may not be what you want.
export const variables = defineEnvVars({
  npm_package_version: { static: true },
  PUBLIC_GTFS_ENDPOINT: { public: true, schema: (input) => input ?? '' },
  PUBLIC_GTFS_REALTIME_ENDPOINT: { public: true, schema: (input) => input ?? '' },
  WAKA_REALTIME_CONFIG: { schema: (input) => input ?? '' },
  WAKA_REALTIME_SECRETS: { schema: (input) => input ?? '' },
  WAKA_ORCHESTRATOR_ACCESS_TOKEN: { schema: (input) => input ?? '' },
  WAKA_ORCHESTRATOR_CACHE_PERIOD: { schema: (input) => input ?? '' },
  AWS_S3_ENDPOINT: { schema: (input) => input ?? '' },
  AWS_ACCESS_KEY_ID: { schema: (input) => input ?? '' },
  AWS_SECRET_ACCESS_KEY: { schema: (input) => input ?? '' },
  WAKA_ORCHESTRATOR_CONFIG: { schema: (input) => input ?? '' },
  WAKA_ORCHESTRATOR_SECRETS: { schema: (input) => input ?? '' },
})
