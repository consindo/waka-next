<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { transit_realtime } from 'gtfs-realtime-bindings'

  import { invalidate } from '$app/navigation'
  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'
  import StopTimes from '$lib/components/StopTimes.svelte'
  import { formatStopName } from '$lib/utils/formatStopName'
  import { variables } from '$lib/variables'
  import ServiceAlerts from '$lib/components/ServiceAlerts.svelte'

  import { mapState } from '../../../mapstate.svelte.js'

  const { realtimeInvalidationInterval } = variables
  const { data } = $props()

  const stopInfo = $derived(data.data?.stopInfo)
  const name = $derived(formatStopName(stopInfo?.stopName || ''))

  $effect(() => {
    if (stopInfo?.stopLon && stopInfo?.stopLat) {
      mapState.currentStop = [
        {
          prefix: stopInfo.prefix,
          name: name,
          routeType: stopInfo.routes[0]?.routeType || 3,
          coordinates: [stopInfo?.stopLon, stopInfo?.stopLat],
        },
      ]
    } else {
      mapState.currentStop = []
    }
  })

  // we resolve the realtime promises here, so it doesn't flicker when we invalidate the page
  let tripUpdates = $state<transit_realtime.ITripUpdate[]>([])
  let serviceAlerts = $state<transit_realtime.IAlert[]>([])
  $effect(() => {
    ;(async () => (tripUpdates = (await data.tripUpdates).data?.tripUpdates || []))()
    ;(async () => (serviceAlerts = (await data.serviceAlerts).data?.serviceAlerts || []))()
  })

  // we invalidate all the data every 10 seconds
  onMount(() => {
    const interval = setInterval(() => {
      invalidate('stop:stoptimes')
    }, realtimeInvalidationInterval)
    return () => clearInterval(interval)
  })

  onDestroy(() => {
    mapState.currentStop = []
  })
</script>

<Header title={name} subtitle={stopInfo?.stopCode ? `Stop ${stopInfo?.stopCode}` : undefined} />
<ScrollContainer>
  {#if serviceAlerts.length > 0}
    <ServiceAlerts {serviceAlerts} />
  {/if}
  <noscript>Realtime data requires JavaScript to be enabled.</noscript>
  <StopTimes {stopInfo} stopTimes={data.data?.stopTimes || []} {tripUpdates} />
</ScrollContainer>

<style>
  noscript {
    display: block;
    padding: 0.5rem var(--edge-padding);
    font-size: 14px;
  }
</style>
