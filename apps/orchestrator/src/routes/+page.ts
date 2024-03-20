import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/data')
  const data = await res.json()
  return { data }
}
