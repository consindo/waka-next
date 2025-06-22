<script>
  import Header from '$lib/components/Header.svelte'
  import StopTimes from '$lib/components/StopTimes.svelte'

  const { data } = $props()

  const stopInfo = $derived(data.data?.stopInfo)
</script>

<Header
  title={stopInfo?.stopName}
  subtitle={stopInfo?.stopCode ? `Stop ${stopInfo?.stopCode}` : undefined}
/>

<StopTimes {stopInfo} stopTimes={data.data?.stopTimes || []} />
