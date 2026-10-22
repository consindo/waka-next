import { npm_package_version } from '$app/env/private'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => {
  const version = npm_package_version
  return {
    version,
  }
}
