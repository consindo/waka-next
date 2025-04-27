import type { Prefix } from '@lib/client'

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params }) => {
  const prefix = params.prefix as Prefix

  return { prefix }
}
