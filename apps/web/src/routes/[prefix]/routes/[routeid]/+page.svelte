<script lang="ts">
  import { page } from '$app/state'

  import Header from '../../../../components/Header.svelte'

  let { data } = $props()

  const searchParams = $derived(new URLSearchParams(page.url.search))
  const selectedService = $derived(
    (data.services || []).find((i) => i.tripIds.includes(searchParams.get('tripId') || ''))
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
              href="{page.url.pathname}?tripId={service.tripIds[0]}"
              class:selected={selectedService === service}
            >
              <strong>{service.tripHeadsign}</strong>
              <p>{service.servicesCount} services</p>
            </a>
          </li>
        {/each}
      {/if}
    </ul>
    {#if searchParams.get('tripId')}
      <h2>Departures</h2>
      {selectedService?.tripIds.join(', ')}
    {/if}
  {:else}
    <Header title="Not found" />
  {/if}
</div>

<style>
  div {
    padding: 1rem;
  }
  li {
    margin-bottom: 1rem;
  }
  .selected {
    color: #0f0;
  }
  p {
    margin: 0;
  }
</style>
