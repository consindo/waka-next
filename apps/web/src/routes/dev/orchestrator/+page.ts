import type { PageLoad } from './$types'
import type { ActiveRegion, InactiveRegion } from './types'

export const load: PageLoad = async ({ fetch }) => {
  const data = await Promise.all([
    fetch('/api/regions').then((r) => r.json()),
    fetch('/api/regions/all').then((r) => r.json()),
  ])
  const activeRegions = data[0].regions as ActiveRegion[]
  const inactiveRegions = data[1].regions.filter(
    (i: InactiveRegion) => !activeRegions.some((j) => j.region === i.region)
  )
  return { activeRegions, inactiveRegions }
}
