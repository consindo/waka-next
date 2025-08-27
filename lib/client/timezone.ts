import { TZDate } from '@date-fns/tz'
import { addHours, addMinutes, addSeconds } from 'date-fns'

export const convertFromTimezone = (timezone: string, date: string) => {
  date = date.split('Z').join('') // make it not iso format
  const longOffsetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  })
  const longOffsetString = longOffsetFormatter.format(new Date(date))

  const gmtOffset = longOffsetString.split('GMT')[1]

  const d = new Date(date + gmtOffset)
  return d
}

export const convertFromGtfsDateToISOTimestamp = (
  date: string,
  time: string | undefined,
  timezone: string
) => {
  if (time === undefined) return time

  // eslint-disable-next-line prefer-const
  let [year, month, day] = date.split('-').map((i) => parseInt(i))
  month = month - 1
  let newTime = new TZDate(year, month, day, timezone)
  const [hours, minutes, seconds] = time.split(':').map((i) => parseInt(i))
  newTime = addHours(newTime, hours)
  newTime = addMinutes(newTime, minutes)
  newTime = addSeconds(newTime, seconds)
  return newTime.toISOString()
}
