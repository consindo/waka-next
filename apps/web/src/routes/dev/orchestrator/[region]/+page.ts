import type { ActiveRegion, InactiveRegion, Version } from '../types'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params }) => {
  const data = await Promise.all([
    fetch('/api/regions').then((r) => r.json()),
    fetch('/api/regions/all').then((r) => r.json()),
    fetch(`/api/${params.region}`).then((r) => r.json()),
  ])
  const activeRegions = data[0].regions as ActiveRegion[]
  const inactiveRegions = data[1].regions.filter(
    (i: InactiveRegion) => !activeRegions.some((j) => j.region === i.region)
  )
  const details = data[2]
  return {
    id: params.region,
    name: details.name,
    activeRegions,
    activeRegion: activeRegions.find((i) => i.region === params.region),
    inactiveRegions,
    versions: details.versions as Version[],
  }
}
