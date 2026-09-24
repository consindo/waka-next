<script lang="ts">
  import { onMount } from 'svelte'

  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'
  import { moveDrawer } from '$lib/utils/moveDrawer.js'

  import type { PageData } from './$types'
  import RouteGroup from './RouteGroup.svelte'

  let { data }: { data: PageData } = $props()

  onMount(() => {
    moveDrawer('expanded-middle')
  })
</script>

<Header title="Routes" />
<ScrollContainer>
  <div>
    {#each data.groups as group (group.name)}
      <RouteGroup {group} />
    {/each}
  </div>
</ScrollContainer>

<style>
  div {
    padding: calc(var(--edge-padding) - 0.25rem);
  }
</style>
