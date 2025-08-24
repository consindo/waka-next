import type { ServiceResult, TimetableResult } from '@lib/client'

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

export const getDate = (date: string, time: TimetableResult | ServiceResult) => {
  const timeComponent = time.departureTime || time.arrivalTime || '0:00:00'
  const [hours, minutes, seconds] = timeComponent.split(':').map((i) => parseInt(i))
  const dateObj = new Date(`${date || ''} ${hours % 24}:${minutes}:${seconds}`)
  if (hours >= 24) {
    // sometimes timestamps come in as 24:01:00 etc
    dateObj.setDate(dateObj.getDate() + 1)
  }
  return dateObj
}

export const formatTime = (date: Date) => {
  return date.toLocaleString(undefined, {
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
  })
}
