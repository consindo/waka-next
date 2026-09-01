<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { bbox, bboxPolygon, booleanContains, envelope, lineString, point } from '@turf/turf'
  import type { FeatureCollection } from 'geojson'
  import { type GeoJSONSource, type MapLibreEvent, Map as MapLibreMap } from 'maplibre-gl'
  import 'maplibre-gl/dist/maplibre-gl.css'
  import { onMount } from 'svelte'

  import type { RegionResponse } from '@lib/client'

  import { resolveData } from '$lib/dataResolver'

  import { currentRegions, mapState } from '../../routes/mapstate.svelte'

  import { addLayers } from './map/mapLayers'
  import {
    ALL_STOPS_LAYER,
    CURRENT_SHAPE_LAYER,
    CURRENT_STOP_LAYER,
    CURRENT_STOPS_LAYER,
    CURRENT_VEHICLES_LAYER,
    PIXEL_RATIO,
  } from './map/mapConstants'
  import { getRegionsFromBounds, getStops, mapToIcon } from './map/mapData'
  import { getMapIcons } from './map/mapIcons'

  const { regions }: { regions: RegionResponse[] } = $props()
  const regionalBounds = $derived(
    regions.map((region) => ({
      prefix: region.region,
      bounds: envelope(lineString(region.bounds)),
    }))
  )

  const availablePinIcons: Record<string, { id: string; png: string }[]> = {}
  const availableVehicleIcons: Record<string, { id: string; png: string }[]> = {}

  let map: MapLibreMap
  let loadedStopsData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  }
  let mounted = $state(false)
  onMount(async () => {
    let center: number[]
    const cityId = page.url.searchParams.get('city')
    if (mapState.currentStop.length > 0) {
      center = mapState.currentStop[0].coordinates
    } else if (cityId) {
      const city = regions
        .find((i) => i.cities.find((j) => j.id === cityId))
        ?.cities.find((j) => j.id === cityId)
      center = city?.startingLocation || regions[0].cities[0].startingLocation

      const url = new URL(page.url)
      url.searchParams.delete('city')
      goto(url, { replaceState: true })
    } else {
      center = regions[0].cities[0].startingLocation
    }
    map = new MapLibreMap({
      container: 'maplibre-canvas',
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: center as [number, number],
      zoom: 16,
    })

    map.on('load', (e) => {
      addIcons('generic')
      addLayers(map)
      addEvents()
      mounted = true

      // hides the built in transit icons... and a few more - need to do a custom style
      map.setLayoutProperty('poi_r7', 'visibility', 'none')
      map.setLayoutProperty('poi_r1', 'visibility', 'none')
      map.setLayoutProperty('poi_transit', 'visibility', 'none')

      loadStopsOnMap(e)
    })

    const addIcons = async (region: string) => {
      if (availablePinIcons[region]) return // already loaded
      const pins = await getMapIcons(region, 'pins', PIXEL_RATIO)
      const vehicles = await getMapIcons(region, 'vehicles', PIXEL_RATIO)
      availablePinIcons[region] = pins
      availableVehicleIcons[region] = vehicles
      await Promise.all(
        [pins, vehicles].flat().map(async (i) => {
          const image = await map.loadImage(i.png)
          map.addImage(`${region}-${i.id}`, image.data)
        })
      )
    }

    const addEvents = () => {
      map.on('click', ALL_STOPS_LAYER, (e) => {
        const { prefix, stopId } = (e.features || [])[0].properties
        goto(`/${prefix}/stops/${stopId}`, { replaceState: page.url.pathname.includes('/stops/') })
      })
    }

    let previousBounds = $state('')
    const loadStopsOnMap = async (e: MapLibreEvent) => {
      const zoom = e.target.getZoom()
      const bounds = e.target.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()

      const includeBus = zoom >= 14
      const boundsPadding = includeBus ? 0.01 : 0.1

      // we pad a little bit
      const minLat = sw.lat - boundsPadding / 2
      const minLon = sw.lng - boundsPadding
      const maxLat = ne.lat + boundsPadding / 2
      const maxLon = ne.lng + boundsPadding
      const mapBounds = [
        [maxLon, maxLat],
        [minLon, minLat],
      ] as [[number, number], [number, number]]

      // stops the load function from running if it doesn't need to be run
      if (JSON.stringify(mapBounds) === previousBounds) {
        return
      } else {
        previousBounds = JSON.stringify(mapBounds)
      }

      const prefixes = getRegionsFromBounds(regionalBounds, mapBounds)
      currentRegions.ids = prefixes
      prefixes.forEach((i) => addIcons(i))
      const stopsData = await getStops(prefixes, mapBounds, includeBus, availablePinIcons)
      loadedStopsData = stopsData

      const source = map.getSource(ALL_STOPS_LAYER) as GeoJSONSource
      if (source) {
        // we just cache the data for later if a shape is being shown
        if (mapState.currentShape.length > 0) return
        source.setData(loadedStopsData)
      }
    }
    map.on('moveend', loadStopsOnMap)
  })

  // current stop effect
  $effect(() => {
    // otherwise it's ugly
    map.getLayer(ALL_STOPS_LAYER)?.setLayoutProperty('icon-allow-overlap', false)

    if (mapState.currentStop.length > 0 && mounted) {
      const { coordinates } = mapState.currentStop[0]
      map.flyTo({ center: coordinates, zoom: 17, speed: 1.5 })

      const source = map.getSource(CURRENT_STOP_LAYER) as GeoJSONSource
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: mapState.currentStop[0].name,
                icon: mapToIcon(
                  mapState.currentStop[0].prefix,
                  mapState.currentStop[0].routeType,
                  'pin',
                  availablePinIcons
                ),
              },
              geometry: {
                type: 'Point',
                coordinates: coordinates,
              },
            },
          ],
        })
      }
    } else if (mounted) {
      map.getLayer(ALL_STOPS_LAYER)?.setLayoutProperty('icon-allow-overlap', true)

      const source = map.getSource(CURRENT_STOP_LAYER) as GeoJSONSource
      source.setData({
        type: 'FeatureCollection',
        features: [],
      })
    }
  })

  // current shape / visibleStops effect
  let previousShape = $state('')
  $effect(() => {
    // stops the load function from running if it doesn't need to be run
    if (JSON.stringify(mapState.currentShape) === previousShape) {
      return
    } else if (mounted) {
      previousShape = JSON.stringify(mapState.currentShape)
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
              speed: 2,
            })

            if (mapState.currentShape[0].color) {
              map.setPaintProperty(
                CURRENT_SHAPE_LAYER,
                'line-color',
                `#${mapState.currentShape[0].color}`
              )
              map.setPaintProperty(
                CURRENT_STOPS_LAYER,
                'circle-stroke-color',
                `#${mapState.currentShape[0].color}`
              )
            } else {
              map.setPaintProperty(CURRENT_SHAPE_LAYER, 'line-color', `#666`)
              map.setPaintProperty(CURRENT_STOPS_LAYER, 'circle-stroke-color', `#666`)
            }

            const allStopsSource = map.getSource(ALL_STOPS_LAYER) as GeoJSONSource
            allStopsSource.setData({
              type: 'FeatureCollection',
              features: [],
            })
            const currentStopsSource = map.getSource(CURRENT_STOPS_LAYER) as GeoJSONSource
            if (currentStopsSource) {
              currentStopsSource.setData({
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
      const currentStopsSource = map.getSource(CURRENT_STOPS_LAYER) as GeoJSONSource
      currentStopsSource.setData({
        type: 'FeatureCollection',
        features: [],
      })
    }
  })

  // vehicle locations effect
  $effect(() => {
    if (mounted) {
      const source = map.getSource(CURRENT_VEHICLES_LAYER) as GeoJSONSource
      source.setData({
        type: 'FeatureCollection',
        features: mapState.vehicleLocations.map((i) => ({
          type: 'Feature',
          properties: {
            status: i.status,
            icon: mapToIcon(i.prefix, i.routeType, 'vehicle', availableVehicleIcons),
          },
          geometry: {
            type: 'Point',
            coordinates: i.coordinates,
          },
        })),
      })
    }
  })

  // recenters the map if needed...
  $effect(() => {
    const cityId = page.url.searchParams.get('city')
    if (cityId && mounted) {
      const region = regions.find((i) => i.cities.find((j) => j.id === cityId))
      const city = region?.cities.find((j) => j.id === cityId)

      const bounds = map.getBounds()
      const bbox = bboxPolygon([
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ])

      if (city !== undefined) {
        const url = new URL(page.url)
        url.searchParams.delete('city')
        goto(url, { replaceState: true })
      }

      if (city !== undefined && !booleanContains(bbox, point(city.startingLocation))) {
        map.jumpTo({ center: city.startingLocation, zoom: 16 })
      }
    }
  })
</script>

<div id="maplibre-canvas"></div>

<style>
  #maplibre-canvas {
    height: 100%;
  }
</style>
