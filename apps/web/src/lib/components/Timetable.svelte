<script lang="ts">
  import type { RouteResult, ServiceResult, TimetableResult } from '@lib/client'

  import { getDate } from '$lib/utils/formatDate'

  import TimetableItem from './TimetableItem.svelte'

  const {
    timetable,
    route,
    currentService,
    stopId,
  }: {
    timetable: TimetableResult[]
    route: RouteResult
    currentService: ServiceResult
    stopId: string | null
  } = $props()

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
    new Date(`${currentService?.date} ${timetable[initialStopIndex].departureTime}`)
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
      {#each timetable.slice(0, initialStopIndex) as time, i (i)}
        <TimetableItem
          departureTime={getDate(currentService?.date, time)}
          firstService={i === 0}
          lastService={false}
          {time}
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
  {#each timetable.slice(initialStopIndex) as time, i (i)}
    <TimetableItem
      departureTime={getDate(currentService.date, time)}
      firstService={initialStopIndex === 0 && i === 0}
      lastService={i === timetable.length - initialStopIndex - 1}
      {time}
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
