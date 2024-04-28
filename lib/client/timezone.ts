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
