<script>
  import { onDestroy } from 'svelte'

  import Header from '$lib/components/Header.svelte'
  import StopTimes from '$lib/components/StopTimes.svelte'

  import { mapState } from '../../../mapstate.svelte.js'

  const { data } = $props()

  const stopInfo = $derived(data.data?.stopInfo)

  $effect(() => {
    if (stopInfo?.stopLon && stopInfo?.stopLat) {
      mapState.currentStop = [
        {
          stopType: 'bus',
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

<Header
  title={stopInfo?.stopName}
  subtitle={stopInfo?.stopCode ? `Stop ${stopInfo?.stopCode}` : undefined}
/>

<StopTimes {stopInfo} stopTimes={data.data?.stopTimes || []} />
