<script>
  import Header from '$lib/components/Header.svelte'
  import StopTimes from '$lib/components/StopTimes.svelte'

  const { data } = $props()

  const stopInfo = $derived(data.data?.stopInfo ?? null)
</script>

<Header title={stopInfo?.stopName} subtitle={stopInfo?.stopCode} />

<StopTimes childStops={stopInfo?.childStops || []} stopTimes={data.data?.stopTimes || []} />
