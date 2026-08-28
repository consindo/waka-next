<script>
  import { onDestroy } from 'svelte'

  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'
  import StopTimes from '$lib/components/StopTimes.svelte'
  import { tidyStopName } from '$lib/components/tidyStrings.js'

  import { mapState } from '../../../mapstate.svelte.js'
  import ServiceAlerts from '$lib/components/ServiceAlerts.svelte'

  const { data } = $props()

  const stopInfo = $derived(data.data?.stopInfo)
  const name = $derived(tidyStopName(stopInfo?.stopName || ''))
  const tripUpdates = $derived(data.tripUpdates)
  const serviceAlerts = $derived(data.serviceAlerts)

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

  onDestroy(() => {
    mapState.currentStop = []
  })
</script>

<Header title={name} subtitle={stopInfo?.stopCode ? `Stop ${stopInfo?.stopCode}` : undefined} />
<ScrollContainer>
  {#await serviceAlerts then alerts}
    {#if alerts.data?.serviceAlerts && alerts.data.serviceAlerts.length > 0}
      <ServiceAlerts serviceAlerts={alerts.data.serviceAlerts} />
    {/if}
  {/await}
  <noscript>Realtime data requires JavaScript to be enabled.</noscript>
  {#await tripUpdates}
    <StopTimes {stopInfo} stopTimes={data.data?.stopTimes || []} />
  {:then tripUpdates}
    <StopTimes {stopInfo} stopTimes={data.data?.stopTimes || []} tripUpdates={tripUpdates.data?.tripUpdates} />
  {/await}
</ScrollContainer>

<style>
  noscript {
    display: block;
    padding: 0.5rem var(--edge-padding);
    font-size: 14px;
  }
</style>
