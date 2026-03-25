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
  <section class="map">
    <MapCanvas />
  </section>
  <section class="content">
    <div class="content-inner">
      {@render children?.()}
    </div>
  </section>
</main>

<style>
  main {
    height: var(--screen-height);
    box-sizing: border-box;
    overflow-y: scroll;
  }
  .map {
    overflow: hidden;
    height: 100%;
    position: sticky;
    top: 0;
    z-index: 0;
    background: #000;
  }
  .single .map {
    display: none;
  }
  .content {
    position: relative;
    z-index: 2;
  }
  .content-inner {
    background: var(--surface-bg-subtle);
    border-radius: calc(var(--base-border-radius) + 5px) calc(var(--base-border-radius) + 5px) 0 0;
    box-shadow: 0 -1px 8px #00000022;
    overflow: clip;
  }
  @media (min-width: 640px) {
    main {
      padding: var(--screen-padding);
      overflow-y: hidden;
    }
    main:not(.single) {
      display: flex;
      flex-direction: row-reverse;
      gap: 0.5rem;
    }
    main:not(.single) .content {
      width: 360px;
    }
    .map {
      background: transparent;
      flex: 1;
      border: 0.5px solid var(--surface-border);
      border-radius: calc(var(--base-border-radius) + 1px);
      box-shadow: var(--surface-shadow);
    }
    .content-inner {
      border: 0.5px solid var(--surface-border);
      border-radius: calc(var(--base-border-radius) + 1px);
      box-shadow: var(--surface-shadow);
    }
  }
</style>
