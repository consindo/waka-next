<script lang="ts">
  import { page } from '$app/state'

  import type { ServiceResult } from '@lib/client'

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
    {#each filteredServices.slice(0, 3) as service, i (i)}
      <li>
        <a
          data-sveltekit-replacestate
          class:selected={service.tripId === selectedService}
          href="{page.url.pathname}?tripId={service.tripId}"
        >
          <strong>{service.departureTime}</strong>
          {service.tripHeadsign}
        </a>
      </li>
    {/each}
  </ul>

  {#if filteredServices.length > 3}
    <details>
      <summary>More Departures</summary>
      <ul>
        {#each filteredServices.slice(3) as service, i (i)}
          <li>
            <a
              data-sveltekit-replacestate
              class:selected={service.tripId === selectedService}
              href="{page.url.pathname}?tripId={service.tripId}"
            >
              <code>{service.date}</code>
              <strong>{service.departureTime}</strong>
              {service.tripHeadsign}
            </a>
          </li>
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
    color: var(--surface-text);
    text-decoration: none;
    display: block;
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

    &:hover {
      background: var(--surface-bg-hover);
    }
  }
  .selected {
    color: #0f0;
    font-weight: bold;
  }
</style>
