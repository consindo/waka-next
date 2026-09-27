import { TZDateMini } from '@date-fns/tz'

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

  const [year, month, day] = date.split('-').map((i) => parseInt(i))
  const [hours, minutes, seconds] = time.split(':').map((i) => parseInt(i))
  const newTime = new TZDateMini(year, month - 1, day, hours, minutes, seconds, timezone)
  return newTime.toISOString()
}
