<script lang="ts">
  import { page } from '$app/state'

  import Header from '../../../../components/Header.svelte'

  let { data } = $props()

  const searchParams = $derived(new URLSearchParams(page.url.search))
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
  {:else}
    <Header title="Not found" />
  {/if}
</div>

<style>
  div {
    padding: 1rem;
  }
  a {
    text-decoration: none;
  }
  .selected {
    color: #0f0;
    font-weight: bold;
  }
</style>
