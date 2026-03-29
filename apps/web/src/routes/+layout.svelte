<script lang="ts">
  import { onNavigate } from '$app/navigation'
  import { page } from '$app/state'

  import MapCanvas from '$lib/components/MapCanvas.svelte'

  import '../css/app.css'
  import '../css/fonts.css'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
  let mainElement: HTMLElement | undefined = undefined

  onNavigate((navigation) => {
    // if the route id is not changing, we don't run an animation
    if (navigation.from?.route.id === navigation.to?.route.id) {
      return
    }

    // if the api is not supported
    if (!document.startViewTransition) return

    const types: string[] = []
    if ((navigation.delta || 0) < 0) {
      types.push('backward')
    }

    if ((mainElement?.scrollTop || 0) === 0) {
      types.push('collapsed')
    } else if ((mainElement?.scrollTop || 0) < 300) {
      types.push('middle')
    } else {
      types.push('expanded')
    }

    return new Promise((resolve) => {
      document.startViewTransition({
        types,
        update: async () => {
          resolve()
          await navigation.complete
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    })
  })
</script>

<main class:single={page.url.pathname.startsWith('/dev')} bind:this={mainElement}>
  <div class="screen-top"></div>
  <section class="map">
    <div class="map-inner">
      <MapCanvas />
    </div>
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
    scroll-timeline: --page-scroll block;
  }
  main:not(.single) {
    scrollbar-width: none;
    scroll-snap-type: y mandatory;
  }
  .screen-top {
    scroll-snap-align: start;
  }
  @keyframes main-scroll-opacity {
    0% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0.7;
    }
  }
  .map {
    overflow: hidden;
    height: 100%;
    position: sticky;
    top: 0;
    z-index: 0;
    background: #000;
  }
  .map-inner {
    background: var(--surface-bg-subtle);
    height: 100%;
    animation: main-scroll-opacity auto linear;
    animation-timeline: --page-scroll;
  }
  .single .map {
    display: none;
  }
  @keyframes slide-drawer-in {
    0% {
      transform: translateY(var(--current-drawer-height));
    }
    100% {
      transform: translateY(0);
    }
  }
  @keyframes fade-drawer {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0.93;
    }
  }
  @keyframes regular-fade {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  :root::view-transition-new(drawer) {
    animation: 350ms ease slide-drawer-in;
  }
  :root::view-transition-old(drawer) {
    animation: 300ms ease fade-drawer;
    opacity: 0.93;
  }
  :root:active-view-transition-type(collapsed) {
    --current-drawer-height: var(--collapsed-height);
  }
  :root:active-view-transition-type(middle) {
    --current-drawer-height: var(--drawer-midpoint);
  }
  :root:active-view-transition-type(expanded) {
    --current-drawer-height: calc(var(--screen-height) - var(--drawer-top-margin));
  }
  :root:active-view-transition-type(backward) {
    &::view-transition-new(drawer) {
      animation: 300ms ease fade-drawer reverse;
      z-index: 2;
    }
    &::view-transition-old(drawer) {
      animation: 350ms ease slide-drawer-in reverse;
      transform: translateY(var(--current-drawer-height));
      opacity: 1;
      z-index: 3;
    }
  }
  .content {
    --border-radius: calc(var(--base-border-radius) + 5px) calc(var(--base-border-radius) + 5px) 0 0;
    position: relative;
    z-index: 2;
    box-shadow: 0 -1px 8px #00000022;
    border-radius: var(--border-radius);
  }
  /* so when the drawer goes transparent, it has black in the background */
  .content::before {
    content: '';
    background: #000;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    border-radius: var(--border-radius);
  }
  .content-inner {
    view-transition-name: drawer;
    background: var(--surface-bg-subtle);
    border-radius: var(--border-radius);
    overflow: clip;
  }
  @media (min-width: 640px) {
    .screen-top {
      display: none;
    }
    main {
      padding: var(--screen-padding);
    }
    main:not(.single) {
      display: flex;
      flex-direction: row-reverse;
      gap: 0.5rem;
      overflow-y: hidden;
    }
    main:not(.single) .content {
      width: 40vw;
      max-width: 360px;
    }
    .map {
      background: transparent;
      flex: 1;
      border: 0.5px solid var(--surface-border);
      border-radius: calc(var(--base-border-radius) + 1px);
      box-shadow: var(--surface-shadow);
    }
    .map-inner {
      animation: none;
    }
    .content {
      view-transition-name: none;
      box-shadow: none;
    }
    .content::before {
      content: none;
    }
    .content-inner {
      border: 0.5px solid var(--surface-border);
      border-radius: calc(var(--base-border-radius) + 1px);
      box-shadow: var(--surface-shadow);
      view-transition-name: none;
    }
  }
</style>
