import type { ActiveRegion, InactiveRegion, Version } from '../types'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, params, data }) => {
  const apiData = await Promise.all([
    fetch('/api/regions').then((r) => r.json()),
    fetch('/api/regions/all').then((r) => r.json()),
    fetch(`/api/${params.region}`).then((r) => r.json()),
  ])
  const activeRegions = apiData[0].regions as ActiveRegion[]
  const inactiveRegions = apiData[1].regions.filter(
    (i: InactiveRegion) => !activeRegions.some((j) => j.region === i.region)
  )
  const details = apiData[2]
  const { importResult } = data
  return {
    id: params.region,
    name: details.name,
    activeRegions,
    activeRegion: activeRegions.find((i) => i.region === params.region),
    inactiveRegions,
    versions: (details.versions as Version[]).toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    importResult: (importResult || {})[params.region],
  }
}
