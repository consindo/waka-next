import { type Prefix } from '@lib/client'

import { type RegionalConfig } from './regionalTypes'

// waka will work without defining data in here
// but it's adding some customisation to improve the user experience
export const regionalConfig: Record<Prefix, RegionalConfig> = {
  'nz-akl': {
    cities: [
      {
        id: 'nz-akl',
        title: 'Tamaki Makaurau',
        subtitle: 'Auckland',
        startingLocation: [174.767, -36.844],
      },
    ],
  },
}
