<script>
  import { onDestroy } from 'svelte'

  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'
  import StopTimes from '$lib/components/StopTimes.svelte'
  import { tidyStopName } from '$lib/components/tidyStrings.js'

  import { mapState } from '../../../mapstate.svelte.js'

  const { data } = $props()

  const stopInfo = $derived(data.data?.stopInfo)
  const name = $derived(tidyStopName(stopInfo?.stopName || ''))
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
    {#each alerts?.data?.serviceAlerts || [] as alert (alert)}
      <details>
        <summary>{JSON.stringify(alert.headerText)}</summary>
        {JSON.stringify(alert)}
      </details>
    {/each}
  {/await}
  <noscript>Realtime data requires JavaScript to be enabled.</noscript>
  <StopTimes {stopInfo} stopTimes={data.data?.stopTimes || []} />
</ScrollContainer>

<style>
  noscript {
    display: block;
    padding: 0.5rem var(--edge-padding);
    font-size: 14px;
  }
</style>
