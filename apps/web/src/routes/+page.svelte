<script lang="ts">
  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'

  import { currentRegions } from './mapstate.svelte'
</script>

<Header title="Waka" isCloseButtonEnabled={false} />
<ScrollContainer>
  <div>
    <p>this will eventually be the new waka. however it's long way from being done.</p>
    <ul>
      <li><a href="/cities">cities</a></li>
      <li><a href="/{currentRegions.ids.join(',')}/stops">stops</a></li>
      <li><a href="/{currentRegions.ids.join(',')}/routes">routes</a></li>
    </ul>
    <ul>
      <li><a href="/dev/orchestrator">developer console</a></li>
      <li><a href="https://github.com/consindo/waka-next">github</a></li>
    </ul>
  </div>
</ScrollContainer>

<style>
  div {
    padding: 1rem;
  }
</style>
