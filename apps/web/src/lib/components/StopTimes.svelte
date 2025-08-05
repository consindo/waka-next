<script lang="ts">
  import type { StopInfoResult, StopTimesResult } from '@lib/client'

  import { formatShortDate } from '$lib/utils/formatDate'

  const {
    stopInfo,
    stopTimes,
  }: {
    stopInfo?: StopInfoResult
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
          {#if stopInfo}
            {@const substop =
              stopInfo.childStops
                .find((i) => i.stopId === trip.stopId)
                ?.stopName?.replace(stopInfo.stopName || '', '')
                .trim() || ''}
            {#if substop !== ''}
              <p class="substop">
                {#if new Number(substop).toString() === substop}Platform&nbsp;{/if}{substop}
              </p>
            {/if}
          {/if}
        </div>
        <div class="time">
          <h4>{formatShortDate(trip.departureTime, 'short')}</h4>
          {#if route[1] && route[2]}
            {@const secondTime = formatShortDate(route[1].departureTime, 'long')}
            {@const secondTimeShort = formatShortDate(route[1].departureTime)}
            {@const thirdTime = formatShortDate(route[2].departureTime, 'long')}
            {@const thirdTimeShort = formatShortDate(route[2].departureTime)}
            <!-- todo: this is very messy -->
            <p>
              also {#if secondTime.includes('min')}in{:else}at{/if}
              {#if thirdTime.includes('min')}<strong>{secondTimeShort}</strong>,&nbsp;{:else}<strong
                  >{secondTimeShort}</strong
                >{#if secondTime.includes('min')}&nbsp;mins{/if}&nbsp;&amp;&nbsp;{/if}<strong
                >{thirdTimeShort}</strong
              >{#if thirdTime.includes('min')}&nbsp;mins{/if}
            </p>
          {:else if route[1]}
            {@const secondTime = formatShortDate(route[1].departureTime, 'long')}
            <p>
              also {#if secondTime.includes('min')}in{:else}at{/if} <strong>{secondTime}</strong>
            </p>
          {/if}
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
    font-size: 12px;
  }
  .substop {
    margin-top: 0.25rem;
    display: inline-block;
    padding: 2px 4px;
    border: 1px solid #ffffff33;
    border-radius: var(--base-border-radius);
  }
  .time {
    text-align: right;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .time h4 {
    font-size: 1rem;
    margin: 0;
  }
  .time p {
    font-size: 13px;
  }
</style>
