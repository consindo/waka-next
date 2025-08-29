<script lang="ts">
  import { page } from '$app/state'

  import type { ServiceResult } from '@lib/client'

  import ServiceItem from './ServiceItem.svelte'

  const {
    routeName,
    directionId,
    services,
    selectedService,
  }: {
    routeName: string
    directionId: number
    services: ServiceResult[]
    selectedService: string | null
  } = $props()

  const currentService = $derived(services.find((i) => i.tripId === selectedService))
  const derivedDirectionId = $derived(currentService ? currentService.directionId : directionId)
  const filteredServices = $derived(services.filter((i) => i.directionId === derivedDirectionId))
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
      <summary>More Departures</summary>
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
  summary {
    list-style-type: none;
    font-weight: 600;
    padding: 0.75rem;
    border-top: 0.5px solid var(--surface-border);
    font-size: 14px;
    cursor: default;

    &:hover {
      background: var(--surface-bg-hover);
    }
  }
  details[open] summary {
    border-bottom: 0.5px solid var(--surface-border);
  }
</style>
