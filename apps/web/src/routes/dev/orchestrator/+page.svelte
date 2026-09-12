<script lang="ts">
  import type { PageData } from './$types'
  import RegionList from './RegionList.svelte'

  interface Props {
    data: PageData
  }

  let { data }: Props = $props()
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
  @media (min-width: 640px) {
    .container {
      gap: calc(var(--edge-padding) * 2);
      display: flex;
    }
  }
</style>
