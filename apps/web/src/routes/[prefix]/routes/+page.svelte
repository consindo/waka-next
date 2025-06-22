<script lang="ts">
  import Header from '$lib/components/Header.svelte'

  import RouteGroup from './RouteGroup.svelte'

  let { data } = $props()
</script>

<Header title="Routes" />

<div>
  {#each data.groups as group (group.name)}
    <RouteGroup {group} />
  {/each}
</div>

<style>
  div {
    padding: 0.25rem var(--edge-padding);
  }
</style>
