export const formatShortDate = (date: Date, timeZone: string, suffix?: 'long' | 'short') => {
  const now = new Date()
  if (suffix === 'short' && date.getTime() < now.getTime() + 60 * 1000) {
    return 'Due'
  } else if (date.getTime() < now.getTime() + 60 * 90 * 1000) {
    const mins = Math.floor((date.getTime() - now.getTime()) / 1000 / 60)
    return `${mins}${suffix ? (suffix === 'short' ? 'm' : mins === 1 ? ' min' : ' mins') : ''}`
  }
  return date.toLocaleString(undefined, {
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    timeZone,
  })
}
