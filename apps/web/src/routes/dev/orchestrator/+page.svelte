<script lang="ts">
  import type { PageData } from './$types'

  import RegionList from './RegionList.svelte'
  export let data: PageData
</script>

<div class="container">
  <RegionList activeRegions={data.activeRegions} inactiveRegions={data.inactiveRegions} />
  <p>
    {data.activeRegions.length} active {data.activeRegions.length === 1 ? 'region' : 'regions'}.
    {data.inactiveRegions.length} inactive {data.inactiveRegions.length === 1
      ? 'region'
      : 'regions'}.
  </p>
</div>

<style>
  .container {
    display: flex;
    gap: 2rem;
  }
</style>
