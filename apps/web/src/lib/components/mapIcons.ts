const icons = import.meta.glob('@regions/icons/*.svg')

export const getPins = async (region: string, pixelRatio = 1) => {
  const regionalIcons = await Promise.all(
    Object.keys(icons)
      .filter((i) => i.includes(region))
      .map(async (i) => ({
        id: i.split(region + '-')[1],
        svg: ((await icons[i]()) as { default: string }).default,
      }))
  )

  const regionalIconsAsPng: string[] = await Promise.all(
    regionalIcons.map(async (i) => {
      const img = document.createElement('img')
      img.src = i.svg
      return new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (ctx === null) return reject('null canvas ctx')

          canvas.width = img.naturalWidth * pixelRatio
          canvas.height = img.naturalHeight * pixelRatio
          ctx.drawImage(img, 0, 0, img.naturalWidth * pixelRatio, img.naturalHeight * pixelRatio)
          resolve(canvas.toDataURL(`image/png`, 1))
        }
      })
    })
  )

  const result = regionalIcons.map((i, k) => ({
    ...i,
    png: regionalIconsAsPng[k],
  }))

  return result
}
