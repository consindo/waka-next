import { npm_package_version } from '$env/static/private'
import type { PageServerLoad } from './$types'

export const prerender = true

export const load: PageServerLoad = () => {
  const version = npm_package_version
  return {
    version,
  }
}
