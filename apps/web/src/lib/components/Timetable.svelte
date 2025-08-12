<script lang="ts">
  import type { RouteResult, ServiceResult, TimetableResult } from '@lib/client'

  const {
    timetable,
    route,
    currentService,
  }: {
    timetable: TimetableResult[]
    route: RouteResult
    currentService: ServiceResult
  } = $props()

  const initialStopIndex = 0
  const initialTime = $derived(
    new Date(`${currentService?.date} ${timetable[initialStopIndex].departureTime}`)
  )

  const getMinuteDifference = (initialTime: Date, departureTime: Date) => {
    const mins = Math.floor((departureTime.getTime() - initialTime.getTime()) / 1000 / 60)
    if (mins === 1) {
      return '+1 min'
    } else if (mins >= 0) {
      return `+${mins} mins`
    } else {
      return `-${mins} mins`
    }
  }
</script>

<ul
  class="stop-times-wrapper"
  style={`${route.routeColor ? `--route-color: #${route.routeColor};` : ''}`}
>
  {#each timetable as time, i (i)}
    {@const departureTime = new Date(`${currentService?.date || ''} ${time.departureTime}`)}
    {@const transfersWithoutSelf = time.transfers.filter(
      (i) => i.routeShortName !== route?.routeShortName
    )}
    <li class="stop-time">
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
          ><strong>{getMinuteDifference(initialTime, departureTime)}</strong>
          {departureTime.toLocaleString(undefined, {
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
          })}</time
        >
      </a>
    </li>
  {/each}
</ul>

<style>
  a {
    text-decoration: none;
    cursor: default;
  }
  .stop-times-wrapper {
    padding: 0;
    margin: 0;
    --route-color: #444;
  }
  .stop-time {
    --side-padding: 1.25rem;
    display: block;
    padding-left: 1.75rem;
    padding-right: 0.75rem;
    position: relative;

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
  .stop-time:first-child::after,
  .stop-time:last-child::after {
    content: '';
    position: absolute;
    height: 50%;
    width: 4px;
    left: calc(var(--side-padding) - 4px);
    top: 50%;
  }
  .stop-time:last-child::after {
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
    background: var(--surface-bg);
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
