<script lang="ts">
  import { page } from '$app/state'

  import Header from '../../../../components/Header.svelte'

  let { data } = $props()
</script>

{#if data.data && data.data.route}
  <Header title={page.params.routeid} />
  <pre>
  {JSON.stringify(data.data.route, null, 2)}
</pre>
  <h2>Services</h2>
  <ul>
    {#each data.data.services as service, i (i)}
      <li>
        <strong>{service.tripHeadsign}</strong>
        <p>{service.servicesCount} services</p>
      </li>
    {/each}
  </ul>
{:else}
  <Header title="Not found" />
{/if}

<style>
  li {
    margin-bottom: 1rem;
  }
  p {
    margin: 0;
  }
</style>
