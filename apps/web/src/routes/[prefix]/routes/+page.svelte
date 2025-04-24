<script lang="ts">
  import { page } from '$app/stores'

  import RouteGroup from './RouteGroup.svelte'

  let { data } = $props()
</script>

<div>
  <a href="/">home</a>
  <h1>Routes {$page.params.prefix}</h1>
  {#each data.groups as group}
    <RouteGroup {group} />
  {/each}
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
