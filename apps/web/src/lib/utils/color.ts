export const getTextColor = (backgroundColor: string) => {
  const color =
    backgroundColor.charAt(0) === '#' ? backgroundColor.substring(1, 7) : backgroundColor
  const r = parseInt(color.substring(0, 2), 16) // hexToR
  const g = parseInt(color.substring(2, 4), 16) // hexToG
  const b = parseInt(color.substring(4, 6), 16) // hexToB
  const isDark = r * 0.299 + g * 0.587 + b * 0.114 <= 170
  return isDark ? '#fff' : '#000'
}
