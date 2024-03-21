import { browser } from '$app/environment'

import { isClientReady } from './storage'

export const shouldRetrieveFromServer = () => {
  if (browser && isClientReady()) {
    return false
  }
  return true
}
