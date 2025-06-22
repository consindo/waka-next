export const formatShortDate = (date: Date) => {
  return date.toLocaleString('en-NZ', { hour12: false, hour: 'numeric', minute: 'numeric' })
}
