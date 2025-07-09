<script lang="ts">
  import maplibregl from 'maplibre-gl'
  import 'maplibre-gl/dist/maplibre-gl.css'
  import { onMount } from 'svelte'

  import { mapState } from '../../routes/mapstate.svelte'

  let map: maplibregl.Map
  onMount(async () => {
    map = new maplibregl.Map({
      container: 'maplibre-canvas',
      style: 'http://localhost:8090/styles/basic-preview/style.json',
      center: [174.764, -36.851],
      zoom: 14,
    })
  })

  $effect(() => {
    if (mapState.currentStop.length > 0) {
      const { coordinates } = mapState.currentStop[0]
      map.flyTo({ center: coordinates })
    }
  })

  $inspect(mapState)
</script>

<div id="maplibre-canvas"></div>

<style>
  #maplibre-canvas {
    height: 100%;
  }
</style>
