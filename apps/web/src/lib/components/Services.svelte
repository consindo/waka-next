<script lang="ts">
  import { page } from '$app/state'

  import type { ServiceResult } from '@lib/client'

  import ServiceItem from './ServiceItem.svelte'
  import type { transit_realtime } from 'gtfs-realtime-bindings'

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

  const currentService = $derived(services.find((i) => i.tripId === selectedService))
  const derivedDirectionId = $derived(currentService ? currentService.directionId : directionId)
  const filteredServices = $derived(
    services
      .filter((i) => i.directionId === derivedDirectionId)
      .map((i) => {
        const realtimeTrip = tripUpdates.find((j) => j.trip.tripId === i.tripId)
        if (!realtimeTrip) {
          return i
        }

        // this probably has a bit more nuance to think about
        // especially for those european trains that are delayed all the time
        // will build the ui first and see how best to handle this
        let arrivalDelay = realtimeTrip.delay || 0
        let departureDelay = realtimeTrip.delay || 0
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
      return 0
    })()
  )
  const currentFilteredServiceIndex = $derived(
    filteredServices
      .slice(firstVisibleServiceIndex)
      .findIndex((i) => i.tripId === selectedService) + firstVisibleServiceIndex
  )
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

<h2>
  <span>
    {#if services.length - filteredServices.length > 0}
      {derivedDirectionId === 1 ? '→' : '←'}
    {/if}
    {routeName}
  </span>
  {#if services.length - filteredServices.length > 0}
    <a
      data-sveltekit-replacestate
      href="{page.url.pathname}?directionId={(derivedDirectionId + 1) % 2}">↔</a
    >
  {/if}
</h2>
<div class="services-wrapper">
  <ul>
    {#if isShowingHiddenService && filteredServices[currentFilteredServiceIndex]}
      <ServiceItem
        service={filteredServices[currentFilteredServiceIndex]}
        {selectedService}
        {triggerCloseDetails}
      />
    {:else}
      {#each filteredServices.slice(firstVisibleServiceIndex, firstVisibleServiceIndex + 3) as service, i (i)}
        <ServiceItem {service} {selectedService} triggerCloseDetails={() => null} />
      {/each}
    {/if}
  </ul>

  {#if (isShowingHiddenService && filteredServices.length > 0 && currentService) || filteredServices.length > 3}
    <details bind:this={detailsElement}>
      <summary>Departures</summary>
      <ul>
        {#each filteredServices.slice(isShowingHiddenService ? firstVisibleServiceIndex : firstVisibleServiceIndex + 3) as service, i (i)}
          <ServiceItem {service} {selectedService} {triggerCloseDetails} />
        {/each}
      </ul>
    </details>
  {/if}
</div>

<style>
  h2 {
    font-size: 15px;
    color: var(--surface-text-subtle);
    padding: 1rem 0.75rem 0.25rem;
    margin: 0;
    display: flex;

    & span {
      flex: 1;
    }
    & a {
      height: 100%;
      padding: 0 0.5rem;
    }
  }
  .services-wrapper {
    background: var(--surface-bg);
    margin: 0.5rem 0.5rem 0.75rem;
    border-radius: var(--base-border-radius);
    border: 0.5px solid var(--surface-border);
    box-shadow: var(--surface-shadow);
  }
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  a {
    color: inherit;
    text-decoration: none;
    padding: 0.75rem;
    font-size: 14px;
    cursor: default;

    &:hover {
      background: var(--surface-bg-hover);
    }
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

    &:before {
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
    &:before {
      content: 'Fewer ';
    }
  }
</style>
