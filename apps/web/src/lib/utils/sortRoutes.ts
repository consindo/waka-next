import { variables } from '$lib/variables'

/**
 * sorts lettered routes before numbers, and ensures it's a numeric sort
 */
export const sortRoutes = (a: { routeShortName: string }, b: { routeShortName: string }) => {
  const aIsNumber = isNaN(parseInt(a.routeShortName[0]))
  const bIsNumber = isNaN(parseInt(b.routeShortName[0]))
  if (!aIsNumber && bIsNumber) {
    return 1
  }
  if (aIsNumber && !bIsNumber) {
    return -1
  }
  return a.routeShortName.localeCompare(b.routeShortName, variables.language, {
    numeric: true,
    sensitivity: 'base',
  })
}
