import { type RegionalConfig } from '@regions/regionalTypes'

export const nz_akl: RegionalConfig = {
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
      name: 'North Shore',
      where: `route_short_name LIKE '8%' OR (route_short_name LIKE '9%' AND route_short_name NOT LIKE '98%' AND route_short_name NOT LIKE '99%')`,
    },
    {
      name: 'South',
      where: `route_short_name LIKE '3%' OR route_short_name = 'AIR'`,
    },
    {
      name: 'East',
      where: `route_short_name LIKE '7%'`,
    },
    {
      name: 'West',
      where: `route_short_name LIKE '1%'`,
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
  routeOverrides: [
    {
      routeShortName: 'E-W',
      overrides: {
        routeLongName: 'East West Line',
      },
    },
    {
      routeShortName: 'O-W',
      overrides: {
        routeLongName: 'Onehunga West Line',
      },
    },
    {
      routeShortName: 'S-C',
      overrides: {
        routeLongName: 'South City Line',
      },
    },
    {
      routeShortName: 'HUIA',
      overrides: {
        routeLongName: 'Te Huia',
        routeColor: 'F5B914',
      },
    },
    {
      routeShortName: 'WX1',
      overrides: {
        routeLongName: 'Western Express 1',
        routeColor: '00833E',
      },
    },
    {
      routeShortName: 'NX1',
      overrides: {
        routeLongName: 'Northern Express 1',
        routeColor: '1B418F',
      },
    },
    {
      routeShortName: 'NX2',
      overrides: {
        routeLongName: 'Northern Express 2',
        routeColor: '008544',
      },
    },
    {
      routeShortName: 'CTY',
      overrides: {
        routeLongName: 'CityLink',
      },
    },
    {
      routeShortName: 'INN',
      overrides: {
        routeLongName: 'InnerLink',
      },
    },
    {
      routeShortName: 'OUT',
      overrides: {
        routeLongName: 'OuterLink',
      },
    },
    {
      routeShortName: 'TMK',
      overrides: {
        routeLongName: 'TāmakiLink',
      },
    },
    {
      routeShortName: 'AIR',
      overrides: {
        routeLongName: 'AirportLink',
        routeColor: 'F39120',
      },
    },
  ],
}
