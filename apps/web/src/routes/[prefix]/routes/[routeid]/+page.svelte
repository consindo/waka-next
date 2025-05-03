<script lang="ts">
  import { page } from '$app/state'

  import Header from '../../../../components/Header.svelte'

  let { data } = $props()

  const searchParams = $derived(new URLSearchParams(page.url.search))
  const selectedService = $derived(
    (data.services || []).find((i) =>
      i.trips.find((j) => j.id === searchParams.get('tripId') || '')
    )
  )
</script>

<div>
  {#if data.route}
    <Header title={page.params.routeid} />
    <pre>
  {JSON.stringify(data.route, null, 2)}
</pre>
    <h2>Services</h2>
    <ul>
      {#if data.services && data.services.length > 0}
        {#each data.services as service, i (i)}
          <li>
            <a
              href="{page.url.pathname}?tripId={service.trips[0].id}"
              class:selected={selectedService === service}
            >
              {service.tripHeadsign}
            </a>
          </li>
        {/each}
      {/if}
    </ul>
    {#if searchParams.get('tripId')}
      <h2>Departures</h2>
      <ul>
        {#each selectedService?.trips || [] as trip (trip.id)}
          <li><code>{trip.id} {trip.departureTime}</code></li>
        {/each}
      </ul>
    {/if}
  {:else}
    <Header title="Not found" />
  {/if}
</div>

<style>
  div {
    padding: 1rem;
  }
  .selected {
    color: #0f0;
    font-weight: bold;
  }
</style>
