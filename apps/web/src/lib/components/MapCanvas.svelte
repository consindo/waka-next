<script lang="ts">
  import maplibregl, { type GeoJSONSource } from 'maplibre-gl'
  import 'maplibre-gl/dist/maplibre-gl.css'
  import { onDestroy, onMount } from 'svelte'

  import { mapState } from '../../routes/mapstate.svelte'

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
      mounted = true
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
