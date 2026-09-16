// todo: needs to be translatable
export const formatTripHeadsign = (headsign?: string): string[] => {
  headsign = headsign || ''
  if (headsign.length > 0 && headsign?.toUpperCase() === headsign) {
    headsign = headsign
      .split(' ')
      .map((i) => i[0] + i.slice(1).toLowerCase())
      .join(' ')
  }
  const parts = headsign
    .replace(/ TO /gi, ' to ')
    .replace(/ AND /gi, ' & ')
    .replace(/ VIA /gi, ' via ')
    .split(' via ')
    .map((i, k) => {
      if (k > 0) {
        return 'via ' + i + ' '
      }
      return i
    })
    .filter((i) => i !== '')
  return parts
}
