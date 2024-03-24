import type { RequestHandler } from '@sveltejs/kit'

import { variables } from '../../../lib/variables'

export const GET: RequestHandler = ({ fetch }) => {
  return fetch(variables.gtfsEndpoint + `/stops`)
}
