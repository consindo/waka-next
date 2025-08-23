<script lang="ts">
  import { page } from '$app/state'

  import type { ServiceResult } from '@lib/client'

  const {
    services,
    selectedService,
  }: { services: ServiceResult[]; selectedService: string | null } = $props()
</script>

<div class="services-wrapper">
  <ul>
    {#each services.slice(0, 3) as service, i (i)}
      <li>
        <a
          data-sveltekit-replacestate
          class:selected={service.tripId === selectedService}
          href="{page.url.pathname}?tripId={service.tripId}"
        >
          <strong>{service.departureTime}</strong>
          {service.directionId === 1 ? '→' : '←'}
          {service.tripHeadsign}
        </a>
      </li>
    {/each}
  </ul>

  <details>
    <summary>More Departures</summary>
    <ul>
      {#each services.slice(3) as service, i (i)}
        <li>
          <a
            data-sveltekit-replacestate
            class:selected={service.tripId === selectedService}
            href="{page.url.pathname}?tripId={service.tripId}"
          >
            <code>{service.date}</code>
            <strong>{service.departureTime}</strong>
            {service.directionId === 1 ? '→' : '←'}
            {service.tripHeadsign}
          </a>
        </li>
      {/each}
    </ul>
  </details>
</div>

<style>
  .services-wrapper {
    background: var(--surface-bg);
    margin: 0.5rem;
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
    font-size: 13px;

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
