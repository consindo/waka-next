// sensible default groupings
// no city will have all of these
export const defaultRouteGroups = [
  {
    name: 'Metro',
    emoji: '🚇',
    include: { routeType: [1, 12, 400, 401, 402, 403, 404, 405] },
  },
  {
    name: 'Rail',
    emoji: '🚆',
    include: { routeType: [2, 100, 104, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117] },
  },
  {
    name: 'High Speed Rail',
    emoji: '🚄',
    include: { routeType: [101] },
  },
  {
    name: 'Regional Rail',
    emoji: '🚄',
    include: { routeType: [102, 103, 105, 106] },
  },
  {
    name: 'Ferry',
    emoji: '⛴️',
    include: { routeType: [4, 1000, 1200] },
  },
  {
    name: 'Light Rail',
    emoji: '🚈',
    include: { routeType: [0, 900, 901, 902, 903, 904, 905, 906, 1302] },
  },
  {
    name: 'Cable Car',
    emoji: '🚋',
    include: { routeType: [5, 7, 1302, 1400] },
  },
  {
    name: 'Aerial Tramway',
    emoji: '🚡',
    include: { routeType: [6, 1300, 1301, 1303, 1304, 1305, 1306, 1307] },
  },
  {
    name: 'Bus',
    emoji: '🚌',
    include: { routeType: [3, 11, 700, 702, 703, 704, 706, 711, 713, 716, 800] },
  },
  {
    name: 'Night Bus',
    emoji: '🚌',
    include: { routeType: [705] },
  },
  {
    name: 'Coaches',
    emoji: '🚌',
    include: { routeType: [200, 201, 202, 203, 204, 205, 206, 207, 208, 209] },
  },
  {
    name: 'Long Distance Bus',
    emoji: '🚌',
    include: { routeType: [701] },
  },
  {
    name: 'Rail Replacement Bus',
    emoji: '🚌',
    include: { routeType: [714] },
  },
  {
    name: 'School Bus',
    emoji: '🚌',
    include: { routeType: [712, 713] },
  },
  {
    name: 'Other Bus',
    emoji: '🚌',
    include: { routeType: [707, 708, 709, 715] },
  },
  {
    name: 'Other',
    emoji: '🚕',
    include: { routeType: [1100, 1500, 1501, 1502, 1503, 1504, 1505, 1506, 1507, 1700, 1702] },
  },
]
