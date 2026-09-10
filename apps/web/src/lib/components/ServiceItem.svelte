<script lang="ts">
  import { page } from '$app/state'
  import { SvelteURLSearchParams } from 'svelte/reactivity'

  import { formatShortDate } from '$lib/utils/formatDate'
  import { formatTripHeadsign } from '$lib/utils/formatHeadsign'

  import realtimeSvg from '../../icons/realtime.svg?raw'
  import type { RealtimeServiceResult } from '$lib/types'

  const {
    service,
    selectedService,
    triggerCloseDetails,
  }: {
    service: RealtimeServiceResult
    selectedService: string | null
    triggerCloseDetails: () => void
  } = $props()

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
    style={service.routeColor ? `--surface-bg-interactive: #${service.routeColor}` : ''}
    href="{page.url.pathname}?{newSearchParams.toString()}"
    onclick={triggerCloseDetails}
  >
    <div class="destination">
      {#each formatTripHeadsign(service.tripHeadsign) as headsignSegment, index (index)}
        <span>{headsignSegment}&nbsp;</span>{/each}
    </div>
    <div
      class={{
        time: true,
        isRealtime: service.isRealtime,
        hasDeparted: service.hasDeparted,
        // we show the original time if more than 180 seconds early/late
        isEarly:
          !service.hasDeparted && service.departureDelay ? service.departureDelay < -180 : false,
        isLate:
          !service.hasDeparted && service.departureDelay ? service.departureDelay > 180 : false,
      }}
    >
      {#if service.isRealtime}
        <div class="realtime-icon">{@html realtimeSvg}</div>
      {/if}
      <time datetime={service.departureTime || service.arrivalTime}>
        {formatShortDate(
          new Date(service.departureTime || service.arrivalTime || ''),
          service.timezone,
          'long-due'
        )}
      </time>
      <div class="status">
        {#if service.hasDeparted}
          Departed
        {:else if service.departureDelay && service.departureDelay < -180}
          Early ({Math.ceil(service.departureDelay / -60)}m)
        {:else if service.departureDelay && service.departureDelay > 180}
          Late ({Math.ceil(service.departureDelay / 60)}m)
        {:else if service.isRealtime}
          On time
        {:else}
          Scheduled
        {/if}
      </div>
    </div>
  </a>
</li>

<style>
  li:not(:last-child) a {
    border-bottom: 0.5px solid var(--surface-border);
  }
  time {
    font-weight: bold;
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
    border-left: 5px solid var(--surface-bg-pressed);
  }
  a .destination {
    flex: 1;
    font-size: 14px;
    text-wrap: pretty;
  }
  .selected {
    border-color: var(--surface-bg-interactive);
    background: color-mix(in srgb, var(--surface-bg-interactive), transparent 95%);
  }
  a span {
    display: inline-block;
  }
  li:has(a:hover) {
    background: var(--surface-bg-hover);
  }
  .time {
    text-align: right;
    position: relative;
  }
  @keyframes realtime-flicker {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.5;
    }
    75% {
      opacity: 0.9;
    }
    100% {
      opacity: 0.5;
    }
  }
  .realtime-icon {
    position: absolute;
    right: -9px;
    top: -8px;
    animation: realtime-flicker 2000ms infinite ease;
  }
  .realtime-icon :global(svg) {
    color: var(--surface-text-subtle);
  }
  .status {
    font-size: 12px;
    color: var(--surface-text-subtle);
  }
  .isRealtime .status {
    color: var(--surface-text-success);
  }
  .isRealtime.hasDeparted .status {
    color: var(--surface-text-warning);
  }
  .isRealtime.isEarly .status {
    color: var(--surface-text-primary);
  }
  .isRealtime.isLate .status {
    color: var(--surface-text-danger);
  }
</style>
