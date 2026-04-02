<script lang="ts">
  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'
</script>

<Header title="Waka" isCloseButtonEnabled={false} />
<ScrollContainer>
  <div>
    <p>this will eventually be the new waka. however it's long way from being done.</p>
    <ul>
      <li><a href="/regions">regions</a></li>
    </ul>
    <ul>
      <li><a href="/dev/orchestrator">developer console</a></li>
      <li><a href="https://github.com/consindo/waka-next">github</a></li>
    </ul>
    <a href="/nz-akl/shapes/246-850006-e62baee3">test shape</a>
  </div>
</ScrollContainer>

<style>
  div {
    padding: 1rem;
  }
</style>
