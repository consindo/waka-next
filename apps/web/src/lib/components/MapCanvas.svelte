<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import maplibregl, { type GeoJSONSource } from 'maplibre-gl'
  import 'maplibre-gl/dist/maplibre-gl.css'
  import { onMount } from 'svelte'

  import type { Prefix } from '@lib/client'

  import { resolveData } from '$lib/dataResolver'

  import { mapState } from '../../routes/mapstate.svelte'

  const ALL_STOPS_LAYER = 'all-stops'
  const CURRENT_STOP_LAYER = 'current-stop'

  let map: maplibregl.Map
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
        id: ALL_STOPS_LAYER,
        source: ALL_STOPS_LAYER,
        type: 'circle',
        layout: {},
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': 8,
          'circle-stroke-width': 4,
          'circle-stroke-color': '#ff00ff',
        },
      })
      map.on('click', ALL_STOPS_LAYER, (e) => {
        const { prefix, stopId } = (e.features || [])[0].properties
        goto(`/${prefix}/stops/${stopId}`)
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
        source.setData({
          type: 'FeatureCollection',
          features: (stops.data || []).map((i) => ({
            type: 'Feature',
            properties: {
              prefix: i.prefix,
              stopId: i.stopId,
            },
            geometry: {
              type: 'Point',
              coordinates: [i.stopLon, i.stopLat],
            },
          })),
        })
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
  })
</script>

<div id="maplibre-canvas"></div>

<style>
  #maplibre-canvas {
    height: 100%;
  }
</style>
