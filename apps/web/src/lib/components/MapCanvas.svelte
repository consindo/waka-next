<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { bbox } from '@turf/bbox'
  import type { FeatureCollection } from 'geojson'
  import maplibregl, {
    type DataDrivenPropertyValueSpecification,
    type GeoJSONSource,
  } from 'maplibre-gl'
  import 'maplibre-gl/dist/maplibre-gl.css'
  import { onMount } from 'svelte'

  import type { Prefix } from '@lib/client'

  import { resolveData } from '$lib/dataResolver'

  import { mapState } from '../../routes/mapstate.svelte'

  const ALL_STOPS_LAYER = 'all-stops'
  const CURRENT_STOP_LAYER = 'current-stop'
  const CURRENT_SHAPE_LAYER = 'current-shape'

  const routeTypeStroke: DataDrivenPropertyValueSpecification<string> = [
    'match',
    ['get', 'routeType'],
    '1',
    '#fbb03b',
    '2',
    '#223b53',
    '3',
    '#e55e5e',
    '4',
    '#3bb2d0',
    /* other */ '#ccc',
  ]

  let map: maplibregl.Map
  let loadedStopsData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  }
  let mounted = $state(false)
  onMount(async () => {
    // todo: default to regional center
    const center =
      mapState.currentStop.length > 0
        ? mapState.currentStop[0].coordinates
        : ([174.764, -36.851] as [number, number])
    map = new maplibregl.Map({
      container: 'maplibre-canvas',
      style: 'http://localhost:8090/styles/basic-preview/style.json',
      center,
      zoom: 14,
    })

    map.on('load', () => {
      map.addSource(CURRENT_STOP_LAYER, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
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
      map.addLayer({
        id: CURRENT_STOP_LAYER,
        source: CURRENT_STOP_LAYER,
        type: 'circle',
        layout: {},
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': 8,
          'circle-stroke-width': 4,
          'circle-stroke-color': '#0000ff',
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
        type: 'circle',
        layout: {},
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': 8,
          'circle-stroke-width': 4,
          'circle-stroke-color': routeTypeStroke,
        },
      })
      map.on('click', ALL_STOPS_LAYER, (e) => {
        const { prefix, stopId } = (e.features || [])[0].properties
        goto(`/${prefix}/stops/${stopId}`, { replaceState: page.url.pathname.includes('/stops/') })
      })
      mounted = true
    })

    map.on('moveend', async (e) => {
      const bounds = e.target.getBounds()
      const prefix = page.params.prefix as Prefix

      // we pad a little bit
      const sw = bounds.getSouthWest()
      const minLat = sw.lat - 0.01
      const minLon = sw.lng - 0.01
      const ne = bounds.getNorthEast()
      const maxLat = ne.lat + 0.01
      const maxLon = ne.lng + 0.01

      const stops = await resolveData(
        prefix,
        `/stops?bounds=${encodeURIComponent([minLat, maxLat, minLon, maxLon].join(','))}`,
        (client) => client.getStopsByLocation(prefix, minLat, maxLat, minLon, maxLon),
        fetch
      )
      const source = map.getSource(ALL_STOPS_LAYER) as GeoJSONSource
      if (source) {
        loadedStopsData = {
          type: 'FeatureCollection',
          features: (stops.data || []).map((i) => ({
            type: 'Feature',
            properties: {
              prefix: i.prefix,
              stopId: i.stopId,
              routeType: (i.routes[0]?.routeType || 3).toString(),
            },
            geometry: {
              type: 'Point',
              coordinates: [i.stopLon, i.stopLat],
            },
          })),
        }
        // we just cache the data for later if a shape is being shown
        if (mapState.currentShape.length > 0) return
        source.setData(loadedStopsData)
      }
    })
  })

  $effect(() => {
    if (mapState.currentStop.length > 0 && mounted) {
      const { coordinates } = mapState.currentStop[0]
      map.flyTo({ center: coordinates })

      const source = map.getSource(CURRENT_STOP_LAYER) as GeoJSONSource
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: coordinates,
              },
            },
          ],
        })
      }
    } else if (mounted) {
      const source = map.getSource(CURRENT_STOP_LAYER) as GeoJSONSource
      source.setData({
        type: 'FeatureCollection',
        features: [],
      })
    }
    if (mapState.currentShape.length > 0 && mounted) {
      // we fetch the shape here rather than resolving the data on the client like usual
      // this should only run on the client
      const prefix = mapState.currentShape[0].prefix
      const shapeId = mapState.currentShape[0].shapeId
      resolveData(
        prefix,
        `/shapes/${shapeId}`,
        (client) => client.getShape(prefix, shapeId),
        fetch
      ).then((data) => {
        // this one is a bit weird because it might be async
        Promise.all([data.data]).then((shape) => {
          // if the page has already been closed, then don't update the ui
          if (mapState.currentShape.length === 0) return

          // todo: should be able to handle multiple shapes...
          const source = map.getSource(CURRENT_SHAPE_LAYER) as GeoJSONSource
          if (shape[0] !== null && typeof shape[0] !== 'string') {
            const extent = bbox(shape[0])
            source.setData(shape[0])
            map.fitBounds(extent as [number, number, number, number], {
              padding: 32,
            })

            if (mapState.currentShape[0].color) {
              map.setPaintProperty(
                CURRENT_SHAPE_LAYER,
                'line-color',
                `#${mapState.currentShape[0].color}`
              )
              map.setPaintProperty(
                ALL_STOPS_LAYER,
                'circle-stroke-color',
                `#${mapState.currentShape[0].color}`
              )
            } else {
              map.setPaintProperty(CURRENT_SHAPE_LAYER, 'line-color', `#666`)
              map.setPaintProperty(ALL_STOPS_LAYER, 'circle-stroke-color', `#666`)
            }

            const allStopsSource = map.getSource(ALL_STOPS_LAYER) as GeoJSONSource
            if (allStopsSource) {
              allStopsSource.setData({
                type: 'FeatureCollection',
                features: mapState.visibleStops.map((i) => ({
                  type: 'Feature',
                  properties: {
                    prefix: i.prefix,
                    stopId: i.stopId,
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: i.coordinates,
                  },
                })),
              })
            }
          }
        })
      })
    } else if (mounted) {
      const source = map.getSource(CURRENT_SHAPE_LAYER) as GeoJSONSource
      source.setData({
        type: 'FeatureCollection',
        features: [],
      })
      const allStopsSource = map.getSource(ALL_STOPS_LAYER) as GeoJSONSource
      allStopsSource.setData(loadedStopsData)
      map.setPaintProperty(ALL_STOPS_LAYER, 'circle-stroke-color', routeTypeStroke)
    }
  })
</script>

<div id="maplibre-canvas"></div>

<style>
  #maplibre-canvas {
    height: 100%;
  }
</style>
