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

  $effect(() => {
    if (stopInfo?.stopLon && stopInfo?.stopLat) {
      mapState.currentStop = [
        {
          prefix: stopInfo.prefix,
          name: name,
          // todo: doesn't work if there are no stop times...
          routeType: data.data?.stopTimes[0]?.routeType,
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
  <StopTimes {stopInfo} stopTimes={data.data?.stopTimes || []} />
</ScrollContainer>
