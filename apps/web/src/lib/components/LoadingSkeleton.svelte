<script lang="ts">
  import { onMount } from 'svelte'
  import Header from './Header.svelte'
  import { fade } from 'svelte/transition'

  const { height }: { height: number } = $props()

  let isLoadingVisible = $state(false)
  onMount(() => {
    setTimeout(() => (isLoadingVisible = true), 1000)
  })
</script>

<Header title="" />
<div style={`height: ${height}px;`}>
  {#if isLoadingVisible}
    <p transition:fade>Loading...</p>
  {/if}
</div>

<style>
  p {
    text-align: center;
  }
</style>
