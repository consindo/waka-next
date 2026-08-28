// todo: needs to be translatable
export const formatTripHeadsign = (headsign = ''): string[] => {
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
  return parts
}
