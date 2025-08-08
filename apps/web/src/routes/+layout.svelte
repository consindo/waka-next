<script lang="ts">
  import { page } from '$app/state'

  import MapCanvas from '$lib/components/MapCanvas.svelte'

  import '../css/app.css'
  import '../css/fonts.css'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<main class:single={page.url.pathname.startsWith('/dev')}>
  <section class="content">
    <div class="content-inner">
      {@render children?.()}
    </div>
  </section>
  <section class="map">
    <MapCanvas />
  </section>
</main>

<style>
  main:not(.single) {
    display: flex;
    height: 100vh;
    gap: 0.5rem;
    padding: 0.5rem;
    box-sizing: border-box;
  }
  .single .map {
    display: none;
  }
  main:not(.single) .content {
    width: 360px;
    height: 100%;
  }
  .content-inner {
    border: 0.5px solid var(--surface-border);
    border-radius: calc(var(--base-border-radius) + 1px);
    overflow-y: auto;
    max-height: 100%;
    background: var(--surface-bg-subtle);
    box-shadow:
      lch(0 0 0 / 0.022) 0px 3px 6px -2px,
      lch(0 0 0 / 0.044) 0px 1px 1px;
  }
  .map {
    flex: 1;
    border: 0.5px solid var(--surface-border);
    border-radius: calc(var(--base-border-radius) + 1px);
    overflow: hidden;
    box-shadow:
      lch(0 0 0 / 0.022) 0px 3px 6px -2px,
      lch(0 0 0 / 0.044) 0px 1px 1px;
  }
</style>
