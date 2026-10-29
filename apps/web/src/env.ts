import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
  npm_package_version: { static: true },
  PUBLIC_GTFS_ENDPOINT: { public: true, schema: (input) => input },
  PUBLIC_GTFS_REALTIME_ENDPOINT: { public: true, schema: (input) => input },
})
