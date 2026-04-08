// might need to make these regional, not sure
// could possibly move this to the main client too
export const tidyStopName = (stopName: string) => {
  return stopName
    .replace(' Train Station', '')
    .replace(' Ferry Terminal', '')
    .replace('Ferry Terminal - ', '')
    .replace('- Cable Car Station', '')
    .replace(' Station', '')
}
