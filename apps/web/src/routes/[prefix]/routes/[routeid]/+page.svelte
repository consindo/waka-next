<script lang="ts">
  import { page } from '$app/state'

  import Header from '$lib/components/Header.svelte'
  import Timetable from '$lib/components/Timetable.svelte'

  let { data } = $props()

  const searchParams = $derived(new URLSearchParams(page.url.search))
  const tripId = $derived(searchParams.get('tripId'))
  const stopId = $derived(searchParams.get('stopId'))

  const currentService = $derived((data.services || []).find((i) => i.tripId === tripId))
</script>

{#if data.route}
  <Header
    title={data.route.routeShortName}
    subtitle={data.route.routeLongName ||
      (data.services || []).find((i) => i.directionId === 0)?.tripHeadsign}
  />
  <div class="content">
    <div>
      <details>
        <summary>
          <h2>Services</h2>
        </summary>
        <ul>
          {#if data.services && data.services.length > 0}
            {#each data.services as service, i (i)}
              <li>
                <a
                  data-sveltekit-replacestate
                  class:selected={service.tripId === searchParams.get('tripId')}
                  href="{page.url.pathname}?tripId={service.tripId}"
                >
                  <code>{service.date}</code>
                  <strong>{service.departureTime}</strong>
                  {service.directionId === 1 ? '→' : '←'}
                  {service.tripHeadsign}
                </a>
              </li>
            {/each}
          {/if}
        </ul>
      </details>
    </div>
    <div>
      {#if currentService}
        <Timetable timetable={data.timetable} route={data.route} {currentService} {stopId} />
      {/if}
    </div>
  </div>
{:else}
  <Header title="Not found" />
{/if}

<style>
  a {
    text-decoration: none;
  }
  .selected {
    color: #0f0;
    font-weight: bold;
  }
</style>
