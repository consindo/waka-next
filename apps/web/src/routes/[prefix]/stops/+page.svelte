<script lang="ts">
  import { page } from '$app/state'

  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'

  let { data } = $props()
</script>

<Header title="Stops" subtitle={page.params.prefix} />
<ScrollContainer>
  <form>
    <input type="search" name="q" placeholder="Search..." />
    <input type="submit" value="Search" />
  </form>
  <ul>
    {#each data.stops as stop (stop.stopId)}
      <li><a href="/{stop.prefix}/stops/{stop.stopId}">{stop.stopCode} - {stop.stopName}</a></li>
    {/each}
  </ul>
</ScrollContainer>
