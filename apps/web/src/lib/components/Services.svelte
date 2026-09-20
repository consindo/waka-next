<script lang="ts">
  import type { transit_realtime } from 'gtfs-realtime-bindings'
  import { page } from '$app/state'

  import type { ServiceResult } from '@lib/client'

  import type { RealtimeServiceResult } from '$lib/types'

  import ServiceItem from './ServiceItem.svelte'

  import arrowRightSmallSvg from '../../icons/arrow-right-small.svg?raw'
  import spinSvg from '../../icons/spin.svg?raw'
  import chevronRightSvg from '../../icons/chevron-right.svg'

  const SIX_HOURS = 1000 * 60 * 60 * 6

  const {
    routeName,
    directionId,
    services,
    selectedService,
    tripUpdates,
  }: {
    routeName: string
    directionId: number
    services: ServiceResult[]
    selectedService: string | null
    tripUpdates: transit_realtime.ITripUpdate[]
  } = $props()

  const hasDirectionId0 = $derived(services.some((i) => i.directionId === 0))
  const hasDirectionId1 = $derived(services.some((i) => i.directionId === 1))
  const derivedDirectionId = $derived(
    hasDirectionId0 && hasDirectionId1
      ? services.find((i) => i.tripId === selectedService)?.directionId || directionId
      : hasDirectionId0
        ? 0
        : 1
  )
  const filteredServices: RealtimeServiceResult[] = $derived(
    services
      .filter((i) => i.directionId === derivedDirectionId)
      // todo: need to be able to choose the day, so for now we filter out all the services that were 6+ hours ago
      .filter(
        (i) =>
          new Date(i.departureTime || i.arrivalTime || 0).getTime() >
          new Date().getTime() - SIX_HOURS
      )
      .map((i) => {
        const realtimeTrip = tripUpdates.find((j) => j.trip.tripId === i.tripId)
        if (!realtimeTrip) {
          return {
            ...i,
            scheduleRelationship: 'SCHEDULED',
            isRealtime: false,
          }
        }

        // this probably has a bit more nuance to think about
        // especially for those european trains that are delayed all the time
        // will build the ui first and see how best to handle this
        let hasDeparted = false
        let arrivalDelay = realtimeTrip.delay || 0
        let departureDelay = realtimeTrip.delay || 0
        let scheduleRelationship: 'SCHEDULED' | 'SKIPPED' | 'NO_DATA' | 'UNSCHEDULED' = 'SCHEDULED'

        // todo: sometimes selects and gives realtime info to tomorrow's trip
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
          if (stopTimeUpdate.scheduleRelationship) {
            scheduleRelationship = stopTimeUpdate.scheduleRelationship.toString() as
              'SCHEDULED' | 'SKIPPED' | 'NO_DATA' | 'UNSCHEDULED'
          }
        } else if ((realtimeTrip.stopTimeUpdate || []).length > 0) {
          // the vehicle may have left!
          const minStopSequence = Math.min(
            ...(realtimeTrip.stopTimeUpdate || [])
              .map((i) => i.stopSequence)
              .filter((i) => typeof i === 'number')
          )
          if (i.stopSequence < minStopSequence) {
            hasDeparted = true
          }
        }

        let arrivalTime, departureTime
        if (i.arrivalTime) {
          arrivalTime = new Date(
            new Date(i.arrivalTime).getTime() + arrivalDelay * 1000
          ).toISOString()
        }
        if (i.departureTime) {
          departureTime = new Date(
            new Date(i.departureTime).getTime() + departureDelay * 1000
          ).toISOString()
        }

        return {
          ...i,
          arrivalTime,
          arrivalDelay,
          departureTime,
          departureDelay,
          hasDeparted,
          scheduleRelationship,
          isRealtime: true,
        }
      })
  )
  const firstVisibleServiceIndex = $derived(
    (() => {
      const now = new Date()
      const firstService = filteredServices.findIndex(
        (i) =>
          new Date(i.departureTime || i.arrivalTime || '').getTime() > now.getTime() - 3 * 60 * 1000
      )
      if (firstService > -1) return firstService
      return -1
    })()
  )
  const currentFilteredServiceIndex = $derived(
    filteredServices.findIndex((i) => i.tripId === selectedService)
  )
  const currentService = $derived(filteredServices[currentFilteredServiceIndex])
  const isShowingHiddenService = $derived(
    currentFilteredServiceIndex >= firstVisibleServiceIndex + 3
  )

  let detailsElement: HTMLDetailsElement | null = $state(null)
  const triggerCloseDetails = () => {
    if (detailsElement) {
      detailsElement.removeAttribute('open')
    }
  }
</script>

<h2 class={{ 'is-outbound': derivedDirectionId === 1 }}>
  <div>{@html arrowRightSmallSvg}</div>
  <span>
    {routeName}
  </span>
  {#if services.length - filteredServices.length > 0 && hasDirectionId0 && hasDirectionId1}
    <a
      data-sveltekit-replacestate
      href="{page.url.pathname}?directionId={(derivedDirectionId + 1) % 2}"
    >
      {@html spinSvg}
    </a>
  {/if}
</h2>

{#if firstVisibleServiceIndex >= 0}
  <div class="services-wrapper">
    <ul>
      {#if currentFilteredServiceIndex < firstVisibleServiceIndex && currentService}
        <ServiceItem service={currentService} {selectedService} {triggerCloseDetails} />
      {/if}
      {#each filteredServices.slice(firstVisibleServiceIndex, firstVisibleServiceIndex + 3) as service, i (i)}
        <ServiceItem {service} {selectedService} {triggerCloseDetails} />
      {/each}
      {#if isShowingHiddenService && currentService}
        <ServiceItem
          service={currentService}
          {selectedService}
          {triggerCloseDetails}
          hideOnOpen={true}
        />
      {/if}
    </ul>

    {#if (isShowingHiddenService && filteredServices.length - firstVisibleServiceIndex > 4) || filteredServices.length - firstVisibleServiceIndex > 3}
      <details bind:this={detailsElement}>
        <summary
          ><img src={chevronRightSvg} class="img-invert" alt="" /><span>Departures</span></summary
        >
        <ul>
          {#each filteredServices.slice(firstVisibleServiceIndex + 3) as service, i (i)}
            <ServiceItem {service} {selectedService} {triggerCloseDetails} />
          {/each}
        </ul>
      </details>
    {/if}
  </div>
{:else}
  <p>No services found in the next day.</p>
{/if}

<style>
  h2 {
    --header-height: 20px;
    font-size: 16px;
    color: var(--surface-text-subtle);
    padding: 1rem 0.5rem 0 0.75rem;
    margin: 0;
    display: flex;
    gap: 0.375rem;
    line-height: var(--header-height);

    div {
      margin-top: 0.25rem;
      line-height: calc(var(--header-height) - 2px);
    }
    :global(svg) {
      color: inherit;
    }
    &.is-outbound :global(svg) {
      transform: rotate(-180deg);
    }
    span {
      margin-top: 0.25rem;
      flex: 1;
    }
    a {
      color: inherit;
      text-decoration: none;
      height: calc(var(--header-height) + 4px);
      width: calc(var(--header-height) + 4px);
      cursor: default;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--base-border-radius);
      border: 0.5px solid var(--surface-border);
      background: var(--surface-bg);
      box-shadow: var(--surface-shadow);

      &:hover {
        background: var(--surface-bg-hover);
      }
      &:active {
        background: var(--surface-bg-pressed);
      }

      :global(svg) {
        transition: 300ms ease transform;
        width: 16px;
        height: 16px;
      }
    }
  }
  .services-wrapper {
    background: var(--surface-bg);
    margin: 0.5rem;
    border-radius: var(--base-border-radius);
    border: 0.5px solid var(--surface-border);
    box-shadow: var(--surface-shadow);
    overflow: hidden;
  }
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  details {
    display: flex;
    flex-direction: column;
  }
  summary {
    list-style-type: none;
    font-weight: 600;
    padding: 0.75rem;
    border-top: 0.5px solid var(--surface-border);
    font-size: 14px;
    cursor: default;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--surface-text-subtle);

    img {
      width: 16px;
      height: 16px;
      transform: rotate(90deg);
    }

    span::before {
      content: 'More ';
    }

    &:hover {
      background: var(--surface-bg-hover);
    }
  }
  details[open] {
    flex-direction: column-reverse;
    border-top: 0.5px solid var(--surface-border);
  }
  details[open] summary {
    span::before {
      content: 'Fewer ';
    }
    img {
      transform: rotate(-90deg);
    }
  }
  p {
    text-align: center;
    background: var(--surface-bg-subtle);
    margin: 0;
    padding: 1.25rem 0.75rem 1.5rem;
    color: var(--surface-text-subtle);
    font-size: 14px;
  }
</style>
