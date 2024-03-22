import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/routes')
  const data = await res.json()
  return { data }
}
