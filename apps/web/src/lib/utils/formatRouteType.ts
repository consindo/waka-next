const routeTypeMap: Record<string, RouteType> = {
  '-1': {
    id: 'pin',
    name: 'Unknown',
    route: 'Unknown route',
  },
  '0': {
    id: 'tram',
    name: 'Tram',
    route: 'Tram line',
  },
  '2': {
    id: 'train',
    name: 'train',
    route: 'Train line',
  },
  '3': {
    id: 'bus',
    name: 'bus',
    route: 'Bus route',
  },
  '4': {
    id: 'ferry',
    name: 'ferry',
    route: 'Ferry route',
  },
  '5': {
    id: 'funicular',
    name: 'funicular',
    route: 'Funicular line',
  },
}

interface RouteType {
  id: string
  name: string
  route: string
}

/**
 * Takes a GTFS route_type and returns the actual vehicle
 */
export const formatRouteType = (routeType: number): RouteType => {
  return routeTypeMap[routeType.toString()] || routeTypeMap['-1']
}
