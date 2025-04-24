<script lang="ts">
  import type { PageData } from './$types'

  interface Props {
    data: PageData
  }

  let { data }: Props = $props()
</script>

<div>
  <h1>waka:next</h1>
  <p>this will eventually be the new waka. however it's long way from being done.</p>
  <ul>
    <li><a href="/dev/orchestrator">developer console</a></li>
    <li><a href="https://github.com/consindo/waka-next">github</a></li>
  </ul>
  <h2>available regions</h2>
  <p>waka currently loads any regions that are in your current location</p>
  <ul>
    {#each data.regions as region}
      <li>
        {region.region}
        <ul>
          <li><a href="/{region.region}/stops">stops</a></li>
          <li><a href="/{region.region}/routes">routes</a></li>
        </ul>
      </li>
    {/each}
  </ul>
  <a href="/nz-akl/shapes/246-850006-e62baee3">test shape</a>
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
