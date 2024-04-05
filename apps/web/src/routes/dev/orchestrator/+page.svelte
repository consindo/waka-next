<script lang="ts">
  import RegionList from './RegionList.svelte'
  export let data
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
