<script lang="ts">
  import { page } from '$app/state'

  import type { ServiceResult } from '@lib/client'

  import { formatShortDate } from '$lib/utils/formatDate'

  const { service, selectedService }: { service: ServiceResult; selectedService: string | null } =
    $props()

  const existingSearchParams = $derived(new URLSearchParams(page.url.search))

  const newSearchParams = $derived(
    (() => {
      const p = new URLSearchParams(existingSearchParams)
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
  >
    <strong
      >{formatShortDate(
        new Date(service.departureTime || service.arrivalTime || ''),
        service.timezone,
        'long'
      )}</strong
    >
    <span>{service.tripHeadsign}</span>
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
    font-size: 14px;
    cursor: default;
    gap: 0.75rem;
    align-items: center;
  }
  a span {
    flex: 1;
    font-size: 13px;
  }
  li:has(a:hover) {
    background: var(--surface-bg-hover);
  }
  .selected {
    color: var(--surface-bg-interactive);
  }
</style>
