<script lang="ts">
  import Header from '../../../components/Header.svelte'
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
    padding: 0.25rem 0.75rem;
  }
</style>
