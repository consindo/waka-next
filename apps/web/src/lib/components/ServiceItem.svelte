<script lang="ts">
  import { page } from '$app/state'
  import { SvelteURLSearchParams } from 'svelte/reactivity'

  import type { ServiceResult } from '@lib/client'

  import { formatShortDate } from '$lib/utils/formatDate'
  import { formatTripHeadsign } from '$lib/utils/formatHeadsign'

  const {
    service,
    selectedService,
    triggerCloseDetails,
  }: { service: ServiceResult; selectedService: string | null; triggerCloseDetails: () => void } =
    $props()

  const existingSearchParams = $derived(new URLSearchParams(page.url.search))

  const newSearchParams = $derived(
    (() => {
      const p = new SvelteURLSearchParams(existingSearchParams)
      p.set('tripId', service.tripId)
      return p
    })()
  )
</script>

<li>
  <a
    data-sveltekit-replacestate
    class:selected={service.tripId === selectedService}
    href="{page.url.pathname}?{newSearchParams.toString()}"
    onclick={triggerCloseDetails}
  >
    <strong
      >{formatShortDate(
        new Date(service.departureTime || service.arrivalTime || ''),
        service.timezone,
        'long'
      )}</strong
    >

    <div>
      {#each formatTripHeadsign(service.tripHeadsign) as headsignSegment, index (index)}
        <span>{headsignSegment}</span>{/each}
    </div>
  </a>
</li>

<style>
  li:not(:last-child) a {
    border-bottom: 0.5px solid var(--surface-border);
  }
  a {
    color: var(--surface-text);
    text-decoration: none;
    display: flex;
    padding: 0.75rem;
    font-size: 15px;
    cursor: default;
    gap: 0.75rem;
    align-items: center;
  }
  a div {
    flex: 1;
    font-size: 14px;
    text-wrap: pretty;
  }
  a span {
    display: inline-block;
  }
  li:has(a:hover) {
    background: var(--surface-bg-hover);
  }
  .selected {
    color: var(--surface-bg-interactive);
  }
</style>
