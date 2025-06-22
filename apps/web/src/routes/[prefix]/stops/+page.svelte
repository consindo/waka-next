<script lang="ts">
  import { page } from '$app/state'

  import Header from '../../../components/Header.svelte'

  let { data } = $props()
</script>

<Header title="Stops" subtitle={page.params.prefix} />
<div>
  <form>
    <input type="search" name="q" placeholder="Search..." />
    <input type="submit" value="Search" />
  </form>
  <ul>
    {#each data.stops as stop (stop.stopId)}
      <li><a href="/{stop.prefix}/stops/{stop.stopId}">{stop.stopCode} - {stop.stopName}</a></li>
    {/each}
  </ul>
</div>

<style>
  div {
    padding: 0.75rem;
  }
</style>
