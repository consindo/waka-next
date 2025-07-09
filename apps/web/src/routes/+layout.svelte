<script lang="ts">
  import MapCanvas from '$lib/components/MapCanvas.svelte'

  import '../css/app.css'
  import '../css/fonts.css'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<main>
  <section class="content">
    {@render children?.()}
  </section>
  <section class="map">
    <MapCanvas />
  </section>
</main>

<style>
  main {
    display: flex;
    height: 100vh;
  }
  .content {
    width: 360px;
    border-right: 1px solid var(--surface-border);
    box-shadow: var(--surface-shadow);
    overflow-y: scroll;
    height: 100%;
  }
  .map {
    flex: 1;
  }
</style>
