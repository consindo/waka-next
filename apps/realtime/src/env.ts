import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
  WAKA_REALTIME_CONFIG: { schema: (input) => input },
  WAKA_REALTIME_SECRETS: { schema: (input) => input },
})
