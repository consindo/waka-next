import { type Prefix } from '@lib/client'

import { nz_akl } from './config/nz-akl'
import { type RegionalConfig } from './regionalTypes'

// waka will work without defining data in here
// but it's adding some customisation to improve the user experience
export const regionalConfig: Record<Prefix, RegionalConfig> = {
  'nz-akl': nz_akl,
  'nz-wlg': {
    cities: [
      {
        id: 'nz-wlg',
        title: 'Pōneke',
        subtitle: 'Wellington',
        startingLocation: [174.78, -41.279],
      },
    ],
  },
  'nz-chc': {
    cities: [
      {
        id: 'nz-chc',
        title: 'Ōtautahi',
        subtitle: 'Christchurch',
        startingLocation: [172.638, -43.535],
      },
    ],
  },
  'nz-otg': {
    cities: [
      {
        id: 'nz-dud',
        title: 'Ōtepoti',
        subtitle: 'Dunedin',
        startingLocation: [170.504, -45.874],
      },
      {
        id: 'nz-zqn',
        title: 'Tāhuna',
        subtitle: 'Queenstown',
        startingLocation: [168.661, -45.032],
      },
    ],
  },
}
