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
    overflow-y: scroll;
    height: 100%;
  }
  .map {
    flex: 1;
    border: 0.5px solid var(--surface-border);
    margin: 0.5rem;
    border-radius: 4px;
    overflow: hidden;
    box-shadow:
      lch(0 0 0 / 0.022) 0px 3px 6px -2px,
      lch(0 0 0 / 0.044) 0px 1px 1px;
  }
</style>
