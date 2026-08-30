<script lang="ts">
  import { page } from '$app/state'
  import { onDestroy, onMount } from 'svelte'
  import type { transit_realtime } from 'gtfs-realtime-bindings'

  import { invalidate } from '$app/navigation'
  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'
  import ServiceAlerts from '$lib/components/ServiceAlerts.svelte'
  import Services from '$lib/components/Services.svelte'
  import Timetable from '$lib/components/Timetable.svelte'
  import { formatTripHeadsign } from '$lib/utils/formatHeadsign'
  import { variables } from '$lib/variables'

  import { mapState } from '../../../../routes/mapstate.svelte'

  const { realtimeInvalidationInterval } = variables
  const { data } = $props()

  const searchParams = $derived(new URLSearchParams(page.url.search))
  const tripId = $derived(searchParams.get('tripId'))
  const stopId = $derived(searchParams.get('stopId'))

  const currentService = $derived((data.services || []).find((i) => i.tripId === tripId))

  const directionId = $derived(
    parseInt(searchParams.get('directionId') || currentService?.directionId.toString() || '0')
  )

  // we resolve the realtime promises here, so it doesn't flicker when we invalidate the page
  let tripUpdates = $state<transit_realtime.ITripUpdate[]>([])
  let serviceAlerts = $state<transit_realtime.IAlert[]>([])
  let vehicleLocations = $state<transit_realtime.IVehiclePosition[]>([])
  $effect(() => {
    ;(async () => (tripUpdates = (await data.tripUpdates).data?.tripUpdates || []))()
    ;(async () => (serviceAlerts = (await data.serviceAlerts).data?.serviceAlerts || []))()
    ;(async () => (vehicleLocations = (await data.vehicleLocations).data?.vehicleLocations || []))()
  })

  $effect(() => {
    if (currentService?.shapeId !== undefined) {
      mapState.currentShape = [
        {
          prefix: currentService.prefix,
          shapeId: currentService.shapeId,
          color: currentService.routeColor,
        },
      ]
    }
    mapState.visibleStops = data.timetable.map((i) => ({
      prefix: i.prefix,
      stopId: i.parentStopId || i.stopId,
      stopName: i.parentStopName || i.stopName,
      coordinates: [i.stopLon, i.stopLat],
    }))
  })

  $effect(() => {
    mapState.vehicleLocations = vehicleLocations.flatMap((i) => {
      const lat = i.position?.latitude
      const lon = i.position?.longitude
      if (!(lat && lon && data.route)) return []
      return {
        coordinates: [lon, lat],
        routeType: data.route.routeType,
      }
    })
  })

  // we invalidate all the data every 10 seconds
  onMount(() => {
    const interval = setInterval(() => {
      invalidate('route:timetable')
    }, realtimeInvalidationInterval)
    return () => clearInterval(interval)
  })

  onDestroy(() => {
    mapState.currentShape = []
    mapState.visibleStops = []
    mapState.vehicleLocations = []
  })
</script>

{#if data.route}
  <Header title={data.route.routeShortName} />
  <ScrollContainer>
    <div>
      {#if serviceAlerts.length > 0}
        <ServiceAlerts {serviceAlerts} />
      {/if}
      {#if data.services && data.services.length > 0}
        <Services
          {directionId}
          {tripUpdates}
          routeName={data.route.routeLongName ||
            formatTripHeadsign(
              (data.services || []).find((i) => i.directionId === directionId)?.tripHeadsign
            ).join(' ') ||
            data.route.routeShortName}
          services={data.services}
          selectedService={searchParams.get('tripId')}
        />
      {/if}
    </div>
    <div>
      {#if currentService}
        <Timetable
          timetable={data.timetable}
          route={data.route}
          {currentService}
          {stopId}
          {tripUpdates}
        />
      {/if}
    </div>
  </ScrollContainer>
{:else}
  <Header title="Not found" />
{/if}
