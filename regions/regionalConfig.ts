import { type Prefix } from '@lib/client'

import { type RegionalConfig } from './regionalTypes'

// waka will work without defining data in here
// but it's adding some customisation to improve the user experience
export const regionalConfig: Record<Prefix, RegionalConfig> = {
  'nz-akl': {
    cities: [
      {
        id: 'nz-akl',
        title: 'Tāmaki Makaurau',
        subtitle: 'Auckland',
        startingLocation: [174.767, -36.844],
      },
    ],
    routeGroups: [
      {
        name: 'Train & Rapid Bus',
        where: `route_type == 2 OR route_short_name LIKE '_X%'`,
      },
      {
        name: 'Ferries',
        where: 'route_type == 4',
      },
      {
        name: 'Central',
        where: `route_short_name LIKE '10%' OR route_short_name LIKE '2%' OR route_short_name like '6%' OR route_short_name = 'CTY' OR route_short_name = 'INN' OR route_short_name = 'OUT' OR route_short_name = 'TMK'`,
      },
      {
        name: 'South',
        where: `route_short_name LIKE '3%' OR route_short_name = 'AIR'`,
      },
      {
        name: 'West',
        where: `route_short_name LIKE '1%'`,
      },
      {
        name: 'North Shore',
        where: `route_short_name LIKE '8%' OR (route_short_name LIKE '9%' AND route_short_name NOT LIKE '98%' AND route_short_name NOT LIKE '99%')`,
      },
      {
        name: 'Hibiscus Coast & Rodney',
        where: `route_short_name LIKE '98%' OR route_short_name LIKE '99%' OR route_short_name = 'MEX'`,
      },
      {
        name: 'Rail Replacement',
        where: `route_short_name LIKE 'RB%'`,
      },
    ],
  },
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
