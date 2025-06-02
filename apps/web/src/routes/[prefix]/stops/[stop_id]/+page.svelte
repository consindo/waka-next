<script>
  import Header from '../../../../components/Header.svelte'

  const { data } = $props()

  const now = $derived(new Date())
  const stopInfo = $derived(data.data?.stopInfo ?? null)
  const stopTimes = $derived(
    (data.data?.stopTimes ?? []).flatMap((i) => {
      if (!i.departureTime) return []
      const departureTime = new Date(i.departureTime)
      // don't show if it was supposed to show up 3 minutes ago
      if (departureTime.getTime() < now.getTime() - 3 * 60 * 1000) return []

      i.departureTime = departureTime.toLocaleString()
      return [i]
    })
  )
</script>

<Header title={stopInfo?.stopName} subtitle={stopInfo?.stopCode} />

<ul>
  {#each stopTimes as trip, key (key)}
    <li>
      <a href="/{trip.prefix}/routes/{trip.routeId}?tripId={encodeURIComponent(trip.tripId)}">
        <p>
          <strong>{trip.routeShortName}</strong>
          {trip.tripHeadsign}
        </p>
        <p>{stopInfo?.childStops.find((i) => i.stopId === trip.stopId)?.stopName}</p>
        <small>{trip.departureTime}</small>
      </a>
    </li>
  {/each}
</ul>
