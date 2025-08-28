<script lang="ts">
  import type { StopInfoResult, StopTimesResult } from '@lib/client'

  import { getTextColor } from '$lib/utils/color'
  import { formatShortDate } from '$lib/utils/formatDate'

  const {
    stopInfo,
    stopTimes,
  }: {
    stopInfo?: StopInfoResult
    stopTimes: StopTimesResult[]
  } = $props()

  const filteredTimes = $derived(
    stopTimes.flatMap((i) => {
      if (!i.departureTime) return []
      const now = new Date()
      const departureTime = new Date(i.departureTime)
      // don't show if it was supposed to show up 3 minutes ago
      if (departureTime.getTime() < now.getTime() - 3 * 60 * 1000) return []

      return [{ ...i, departureTime }]
    })
  )
  const groupedTimes = $derived(Object.groupBy(filteredTimes, (i) => i.routeId + i.directionId))
</script>

<ul>
  {#if Object.keys(groupedTimes).length === 0}
    <li class="empty">No services found at this station today.</li>
  {/if}
  {#each Object.keys(groupedTimes) as routeId (routeId)}
    {@const route = groupedTimes[routeId] || []}
    {@const trip = route[0]}
    {@const departureTime = formatShortDate(trip.departureTime, trip.agencyTimezone, 'short')}
    <li>
      <a
        href="/{trip.prefix}/routes/{trip.routeId}?tripId={encodeURIComponent(
          trip.tripId
        )}&stopId={encodeURIComponent(trip.stopId)}"
        style={`${trip.routeColor ? `color: ${getTextColor(trip.routeColor)};` : ''}${trip.routeColor ? `background: #${trip.routeColor};` : ''}`}
      >
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
          <h4 class:mins={departureTime.includes('m')}>{departureTime}</h4>
          {#if route[1] && route[2]}
            {@const secondTime = formatShortDate(
              route[1].departureTime,
              trip.agencyTimezone,
              'long'
            )}
            {@const secondTimeShort = formatShortDate(route[1].departureTime, trip.agencyTimezone)}
            {@const thirdTime = formatShortDate(
              route[2].departureTime,
              trip.agencyTimezone,
              'long'
            )}
            {@const thirdTimeShort = formatShortDate(route[2].departureTime, trip.agencyTimezone)}
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
            {@const secondTime = formatShortDate(
              route[1].departureTime,
              trip.agencyTimezone,
              'long'
            )}
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
    text-wrap: pretty;
  }
  li.empty {
    text-align: center;
    background: var(--surface-bg-subtle);
    padding: 1.5rem 1rem;
    color: var(--surface-text-subtle);
    font-size: 14px;
  }
  .substop {
    margin-top: 0.375rem;
    display: inline-block;
    padding: 2px 4px;
    border: 0.5px solid #ffffff44;
    background: #ffffff18;
    border-radius: var(--base-border-radius);
    font-size: 11px;
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
  .time h4.mins {
    font-size: 1.125rem;
  }
  .time p {
    font-size: 13px;
  }
</style>
