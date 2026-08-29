<script lang="ts">
  import type { RouteResult, ServiceResult, TimetableResult } from '@lib/client'
  import type { transit_realtime } from 'gtfs-realtime-bindings'

  import { getDate } from '$lib/utils/formatDate'

  import TimetableItem from './TimetableItem.svelte'

  const {
    timetable,
    route,
    currentService,
    stopId,
    tripUpdates,
  }: {
    timetable: TimetableResult[]
    route: RouteResult
    currentService: ServiceResult
    stopId: string | null
    tripUpdates: transit_realtime.ITripUpdate[]
  } = $props()

  const realtimeTrip = $derived(tripUpdates.find((i) => i.trip.tripId === currentService.tripId))

  const realtimeTimetable = $derived(
    timetable.map((i) => {
      let arrivalTime = i.arrivalTime ? getDate(currentService.date, i, 'arrivalTime') : undefined
      let departureTime = i.departureTime
        ? getDate(currentService.date, i, 'departureTime')
        : undefined

      let arrivalDelay = 0
      let departureDelay = 0
      if (realtimeTrip) {
        if (realtimeTrip.delay) {
          arrivalDelay = realtimeTrip.delay
          departureDelay = realtimeTrip.delay
        }
        const stopTimeUpdate = realtimeTrip.stopTimeUpdate?.find(
          (j) => j.stopSequence === i.stopSequence
        )
        if (stopTimeUpdate) {
          if (stopTimeUpdate.arrival?.delay) {
            arrivalDelay = stopTimeUpdate.arrival.delay
          }
          if (stopTimeUpdate.departure?.delay) {
            departureDelay = stopTimeUpdate.departure.delay
          }
        }
      }

      if (arrivalTime) {
        arrivalTime = new Date(arrivalTime.getTime() + arrivalDelay * 1000)
      }
      if (departureTime) {
        departureTime = new Date(departureTime.getTime() + departureDelay * 1000)
      }

      return {
        ...i,
        arrivalTime,
        arrivalDelay,
        departureTime,
        departureDelay,
        isRealtime: !!realtimeTrip,
      }
    })
  )

  const initialStopIndex = $derived(
    (() => {
      if (stopId) {
        const index = timetable.findIndex((i) => i.stopId === stopId)
        if (index > 0) return index
      }
      return 0
    })()
  )
  const initialTime = $derived(
    realtimeTimetable[initialStopIndex].departureTime ||
      realtimeTimetable[initialStopIndex].arrivalTime
  )
</script>

{#if initialStopIndex > 0}
  <details>
    <summary style={`${route.routeColor ? `--route-color: #${route.routeColor};` : ''}`}
      ><span>Show previous {initialStopIndex} {initialStopIndex === 1 ? 'stop' : 'stops'}</span
      ></summary
    >
    <ul
      class="stop-times-wrapper"
      style={`${route.routeColor ? `--route-color: #${route.routeColor};` : ''}`}
    >
      {#each realtimeTimetable.slice(0, initialStopIndex) as time, i (i)}
        <TimetableItem
          prefix={time.prefix}
          stopId={time.parentStopId || time.stopId}
          stopName={time.parentStopName || time.stopName || 'Unknown Stop'}
          transfers={time.transfers}
          departureTime={time.departureTime || time.arrivalTime}
          departureDelay={time.departureDelay || time.arrivalDelay}
          isRealtime={time.isRealtime}
          firstService={i === 0}
          lastService={false}
          {route}
          {initialTime}
        />
      {/each}
    </ul>
  </details>
{/if}
<ul
  class="stop-times-wrapper"
  style={`${route.routeColor ? `--route-color: #${route.routeColor};` : ''}`}
>
  {#each realtimeTimetable.slice(initialStopIndex) as time, i (i)}
    <TimetableItem
      prefix={time.prefix}
      stopId={time.parentStopId || time.stopId}
      stopName={time.parentStopName || time.stopName || 'Unknown Stop'}
      transfers={time.transfers}
      departureTime={time.departureTime || time.arrivalTime}
      departureDelay={time.departureDelay || time.arrivalDelay}
      isRealtime={time.isRealtime}
      firstService={initialStopIndex === 0 && i === 0}
      lastService={i === timetable.length - initialStopIndex - 1}
      {route}
      {initialTime}
    />
  {/each}
</ul>

<style>
  .stop-times-wrapper {
    padding: 0;
    margin: 0;
    --route-color: #444;
  }
  details summary {
    list-style-type: none;
    font-size: 13px;
    font-weight: 600;
    padding: 0.125rem 0.5rem 0.125rem 1.875rem;
    position: relative;
    margin-bottom: 0.25rem;

    & span {
      background: var(--surface-bg-hover);
      cursor: default;
      padding: 0.125rem 0.25rem;
      border-radius: var(--base-border-radius);
      color: var(--surface-text-subtle);
    }

    &::before {
      content: '';
      position: absolute;
      height: 100%;
      top: 0;
      left: 1rem;
      display: block;
      border-left: 4px dotted #888;
    }

    &:hover span {
      background: rgba(0, 0, 0, 0.15);
      color: var(--surface-text);
    }
  }
  details[open] summary {
    display: none;
  }
</style>
