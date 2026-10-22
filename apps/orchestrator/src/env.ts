import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
  AWS_ACCESS_KEY_ID: { schema: (input) => input },
  AWS_S3_ENDPOINT: { schema: (input) => input },
  AWS_SECRET_ACCESS_KEY: { schema: (input) => input },
  WAKA_ORCHESTRATOR_ACCESS_TOKEN: { schema: (input) => input },
  WAKA_ORCHESTRATOR_CACHE_PERIOD: { schema: (input) => input },
  WAKA_ORCHESTRATOR_CONFIG: { schema: (input) => input },
  WAKA_ORCHESTRATOR_SECRETS: { schema: (input) => input },
})
