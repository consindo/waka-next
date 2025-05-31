<script lang="ts">
  import { page } from '$app/state'

  let { data } = $props()
</script>

<div>
  <a href="/">home</a>
  <h2>stops {page.params.prefix}</h2>
  <form>
    <input type="search" name="q" placeholder="Search..." />
    <input type="submit" value="Search" />
  </form>
  <ul>
    {#each data.stops as stop (stop.stopId)}
      <li><a href="/{stop.prefix}/stops/{stop.stopCode}">{stop.stopCode} - {stop.stopName}</a></li>
    {/each}
  </ul>
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
