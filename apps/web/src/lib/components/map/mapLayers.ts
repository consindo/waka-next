import type { MapLibreMap } from 'maplibre-gl'
import {
  ALL_STOPS_LAYER,
  CURRENT_SHAPE_LAYER,
  CURRENT_STOP_LAYER,
  CURRENT_STOPS_LAYER,
  CURRENT_VEHICLES_LAYER,
  PIXEL_RATIO,
} from './mapConstants'

export const addLayers = (map: MapLibreMap) => {
  map.addSource(CURRENT_SHAPE_LAYER, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  })
  map.addSource(ALL_STOPS_LAYER, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  })
  map.addSource(CURRENT_STOP_LAYER, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  })
  map.addSource(CURRENT_STOPS_LAYER, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  })
  map.addSource(CURRENT_VEHICLES_LAYER, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
  })
  map.addLayer({
    id: CURRENT_SHAPE_LAYER,
    source: CURRENT_SHAPE_LAYER,
    type: 'line',
    layout: {},
    paint: {
      'line-color': '#666',
      'line-width': 5,
    },
  })
  map.addLayer({
    id: ALL_STOPS_LAYER,
    source: ALL_STOPS_LAYER,
    type: 'symbol',
    layout: {
      'icon-image': ['get', 'icon'],
      'icon-size': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        ['case', ['==', ['get', 'shouldZoom'], true], 0.75 / PIXEL_RATIO, 1 / PIXEL_RATIO],
        16,
        1 / PIXEL_RATIO,
      ],
      'icon-offset': [0, -15],
      'icon-allow-overlap': false,
      'text-field': ['get', 'stopName'],
      'text-optional': true,
      'text-variable-anchor': ['left', 'right'],
      'text-radial-offset': 1.25,
      'text-size': 11,
      'text-font': ['Noto Sans Semibold'],
      'text-justify': 'auto',
      'text-max-width': 20,
    },
    paint: {
      // todo: maybe this needs to be moved to js, so we can use a transition instead
      'icon-opacity': [
        'step',
        ['zoom'],
        ['case', ['==', ['get', 'shouldZoom'], true], 0, 1],
        14.5,
        1,
      ],
      'text-opacity': ['step', ['zoom'], 0, 12.5, 1],
      'text-color': '#3f3f46',
      'text-halo-color': '#eeeeee',
      'text-halo-width': 0.75,
      'text-translate': [0, -10],
    },
  })
  map.addLayer({
    id: CURRENT_STOP_LAYER,
    source: CURRENT_STOP_LAYER,
    type: 'symbol',
    layout: {
      'icon-image': ['get', 'icon'],
      'icon-size': 1.5 / PIXEL_RATIO,
      'icon-offset': [0, -23],
      'text-field': ['get', 'name'],
      'text-size': 13,
      'text-anchor': 'top',
      'text-font': ['Noto Sans Semibold'],
    },
    paint: {
      'text-color': '#3f3f46',
      'text-halo-color': '#eeeeee',
      'text-halo-width': 0.75,
      'text-translate': [0, 12],
    },
  })
  map.addLayer({
    id: CURRENT_STOPS_LAYER,
    source: CURRENT_STOPS_LAYER,
    type: 'circle',
    layout: {},
    paint: {
      'circle-color': '#ffffff',
      'circle-radius': 5,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#3f3f46',
    },
  })
  map.addLayer({
    id: CURRENT_VEHICLES_LAYER,
    source: CURRENT_VEHICLES_LAYER,
    type: 'symbol',
    layout: {
      'icon-image': ['get', 'icon'],
      'icon-size': 1 / PIXEL_RATIO,
      'text-field': ['get', 'status'],
      'text-variable-anchor': ['left', 'right'],
      'text-radial-offset': 1.25,
      'text-size': 12,
      'text-font': ['Noto Sans Semibold'],
      'text-justify': 'auto',
      'text-max-width': 20,
    },
    paint: {
      'text-color': '#3f3f46',
      'text-halo-color': '#eeeeee',
      'text-halo-width': 0.75,
    },
  })
}
