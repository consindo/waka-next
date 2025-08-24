<script lang="ts">
  import type { RouteResult, TimetableResult } from '@lib/client'

  import { formatTime } from '$lib/utils/formatDate'

  let {
    time,
    initialTime,
    departureTime,
    route,
    firstService,
    lastService,
  }: {
    time: TimetableResult
    initialTime: Date
    departureTime: Date
    route: RouteResult
    firstService: boolean
    lastService: boolean
  } = $props()

  const getMinuteDifference = (initialTime: Date, departureTime: Date) => {
    const mins = Math.floor((departureTime.getTime() - initialTime.getTime()) / 1000 / 60)
    if (mins === 1) {
      return '+1 min'
    } else if (mins === -1) {
      return '-1 min'
    } else if (mins >= 0) {
      return `+${mins} mins`
    } else {
      return `${mins} mins`
    }
  }

  const transfersWithoutSelf = time.transfers.filter(
    (i) => i.routeShortName !== route?.routeShortName
  )

  const relativeTime = $derived(getMinuteDifference(initialTime, departureTime))
  const isInPast = $derived(relativeTime.startsWith('-'))
</script>

<li class="stop-time" class:firstService class:lastService class:isInPast>
  <a href="/{time.prefix}/stops/{time.parentStopId || time.stopId}">
    <div>
      <h4>{time.parentStopName || time.stopName}</h4>
      {#if transfersWithoutSelf.length > 0}
        <ul>
          {#each transfersWithoutSelf as route (route.routeShortName)}
            <li
              style={`${route.routeTextColor ? `color: #${route.routeTextColor};` : ''}${route.routeColor ? `background: #${route.routeColor};` : ''}`}
            >
              {route.routeShortName}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <time
      ><strong>{relativeTime}</strong>
      {formatTime(departureTime)}</time
    >
  </a>
</li>

<style>
  a {
    text-decoration: none;
    cursor: default;
  }
  .stop-time {
    --side-padding: 1.25rem;
    display: block;
    padding-left: 1.75rem;
    padding-right: 0.75rem;
    position: relative;

    &.isInPast {
      opacity: 0.7;
    }

    &:has(a:hover) {
      background: var(--surface-bg-hover);
    }
  }
  .stop-time::after,
  .stop-time::after {
    content: '';
    position: absolute;
    height: 100%;
    width: 4px;
    background: var(--route-color);
    left: calc(var(--side-padding) - 4px);
    top: 0;
  }
  .stop-time.firstService::after,
  .stop-time.lastService::after {
    content: '';
    position: absolute;
    height: 50%;
    width: 4px;
    left: calc(var(--side-padding) - 4px);
    top: 50%;
  }
  .stop-time.lastService::after {
    top: 0;
  }
  .stop-time::before {
    --circle-size: 14px;
    z-index: 1;
    content: '';
    display: block;
    width: var(--circle-size);
    height: var(--circle-size);
    border: 2px solid var(--route-color);
    box-sizing: border-box;
    border-radius: var(--circle-size);
    position: absolute;
    left: calc(var(--circle-size) / -2 - 2px + var(--side-padding));
    top: calc(50% - var(--circle-size) / 2);
    background: #fff;
  }
  .stop-time a {
    display: flex;
    gap: 1rem;
    padding: 0.375rem;
    border-bottom: 0.5px solid var(--surface-border);
    align-items: center;
  }
  .stop-time:last-child a {
    border-bottom: 0;
  }
  .stop-time div {
    flex: 1;
    color: var(--surface-text);
    align-content: center;
  }
  .stop-time h4 {
    font-weight: 600;
    margin: 0;
    font-size: 14px;
  }
  .stop-time div ul {
    margin: 0;
    padding: 0;
  }
  .stop-time div ul li {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    background: #444;
    color: #fff;
    padding: 1px 4px;
    border-radius: 3px;
    margin-right: 2px;
  }
  .stop-time time {
    color: var(--surface-text-subtle);
    text-align: right;
    font-size: 13px;
  }
  .stop-time time strong {
    color: var(--surface-text);
    display: block;
  }
</style>
