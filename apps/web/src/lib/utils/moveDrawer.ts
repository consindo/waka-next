export const getDrawerPosition = () => {
  const clientWidth = document.documentElement.clientWidth
  if (clientWidth >= 640) return 'expanded'

  const drawer = document.getElementById('drawer')
  if (drawer === null) return
  const clientHeight = document.documentElement.clientHeight
  const scrollHeight = drawer.scrollTop
  if (scrollHeight < 100) return 'collapsed'
  if (scrollHeight > clientHeight * 0.8) return 'expanded'
  return 'middle'
}

/**
 * Moves the drawer.
 * Dashed values mean that the drawer won't move if it is in either of those positions.
 * But, it will priorize the first stated position.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const moveDrawer = (
  position:
    | 'collapsed'
    | 'collapsed-middle'
    | 'middle'
    | 'middle-collapsed'
    | 'middle-expanded'
    | 'expanded'
    | 'expanded-middle',
  _dep?: unknown
) => {
  const clientWidth = document.documentElement.clientWidth
  if (clientWidth >= 640) return

  const drawer = document.getElementById('drawer')
  if (drawer === null) return

  const [targetPosition, secondaryPosition] = position.split('-')
  const currentPosition = getDrawerPosition()
  if (currentPosition === targetPosition || currentPosition === secondaryPosition) return

  const clientHeight = document.documentElement.clientHeight

  // if the drawer is already in the right place, don't run the scroll
  if (targetPosition === 'collapsed') {
    drawer.scrollTo({ top: 0, behavior: 'smooth' })
  } else if (targetPosition === 'middle') {
    drawer.scrollTo({ top: clientHeight * 0.45, behavior: 'smooth' })
  } else if (targetPosition === 'expanded') {
    drawer.scrollTo({ top: clientHeight, behavior: 'smooth' })
  }
}
