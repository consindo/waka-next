<script lang="ts">
  import Header from '../../../components/Header.svelte'
  import RouteGroup from './RouteGroup.svelte'

  let { data } = $props()
</script>

<div>
  <Header title="Routes" />
  {#each data.groups as group (group.name)}
    <RouteGroup {group} />
  {/each}
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
