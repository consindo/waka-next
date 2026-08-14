export interface RegionalConfig {
  cities: {
    id: string
    title: string
    subtitle: string
    startingLocation: [number, number]
  }[]
  postImport?: string[]
  routeGroups?: {
    name: string
    where: string
    groupBy?: string
    orderBy?: string
  }[]
  routeOverrides?: {
    agencyId?: string
    routeShortName?: string
    overrides: {
      routeLongName?: string
      routeColor?: string
    }
  }[]
}
