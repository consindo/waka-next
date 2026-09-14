<script lang="ts">
  import { page } from '$app/state'
  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'
</script>

<Header title="Error" />
<ScrollContainer>
  <div>
    <p>{page.error?.message}</p>
    <p><small>Error code: {page.status}</small></p>
  </div>
</ScrollContainer>

<style>
  div {
    padding: var(--edge-padding);
    text-align: center;
  }
  small {
    color: var(--surface-text-subtle);
  }
</style>
