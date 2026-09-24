<script lang="ts">
  import { onMount } from 'svelte'
  import Header from './Header.svelte'

  const { height }: { height: number } = $props()

  let isLoadingVisible = $state(false)
  onMount(() => {
    setTimeout(() => (isLoadingVisible = true), 1000)
  })
</script>

<div class="wrapper">
  <Header title={isLoadingVisible ? 'Loading...' : ''} isLoading={isLoadingVisible} />
  <div style={`height: ${height}px;`}></div>
</div>
