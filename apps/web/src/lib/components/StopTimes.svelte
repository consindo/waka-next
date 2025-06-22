<script lang="ts">
  import type { StopTimesResult } from '@lib/client'

  import { formatShortDate } from '$lib/utils/formatDate'

  const {
    childStops,
    stopTimes,
  }: {
    childStops: {
      stopId: string
      stopName?: string
      platformCode?: string
    }[]
    stopTimes: StopTimesResult[]
  } = $props()

  const now = $derived(new Date())
  const filteredTimes = $derived(
    stopTimes.flatMap((i) => {
      if (!i.departureTime) return []
      const departureTime = new Date(i.departureTime)
      // don't show if it was supposed to show up 3 minutes ago
      if (departureTime.getTime() < now.getTime() - 3 * 60 * 1000) return []

      return [{ ...i, departureTime }]
    })
  )
  const groupedTimes = $derived(Object.groupBy(filteredTimes, (i) => i.routeId))
</script>

<ul>
  {#each Object.keys(groupedTimes) as routeId (routeId)}
    {@const route = groupedTimes[routeId] || []}
    {@const trip = route[0]}
    <li>
      <a href="/{trip.prefix}/routes/{trip.routeId}?tripId={encodeURIComponent(trip.tripId)}">
        <div class="direction">
          <h3>{trip.routeShortName}</h3>
          <p>{trip.directionId === 1 ? '→' : '←'} {trip.tripHeadsign}</p>
          <p><small>{childStops.find((i) => i.stopId === trip.stopId)?.stopName}</small></p>
        </div>
        <div class="time">
          <strong>{formatShortDate(trip.departureTime, 'short')}</strong>
          <ul>
            {#each route.slice(1, 3) as trip, key (key)}
              <li>
                <small>{formatShortDate(trip.departureTime)}</small>
              </li>
            {/each}
          </ul>
        </div>
      </a>
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  li a {
    display: grid;
    grid-template-columns: minmax(100px, 1fr) auto;
    gap: 1.5rem;
    text-decoration: none;
    cursor: default;
    padding: calc(var(--edge-padding) - 0.25rem) var(--edge-padding);
    color: #fff;
    background: #555;
    align-items: center;
    border-bottom: 1px solid var(--surface-border);
  }
  li a:active,
  li a:hover {
    opacity: 0.9;
  }
  li h3 {
    font-size: 1.5rem;
    margin: 0;
  }
  li p {
    margin: 0;
    font-size: 13px;
  }
  .time {
    text-align: right;
    font-size: 13px;
  }
  .time strong {
    font-size: 1rem;
  }
  li ul:not(:empty)::before {
    content: 'and in ';
  }
  li li {
    display: inline;
  }
  li li:not(:last-child)::after {
    content: ', ';
  }
</style>
