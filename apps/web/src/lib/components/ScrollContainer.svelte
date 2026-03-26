<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children?: Snippet
  }

  const { children }: Props = $props()
</script>

<div>
  {@render children?.()}
</div>

<style>
  @keyframes drawer-content {
    0% {
      overflow-y: hidden;
    }
    99% {
      overflow-y: hidden;
    }
    100% {
      overflow-y: scroll;
    }
  }
  div {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    scroll-margin-top: var(--collapsed-height);

    animation: drawer-content auto linear;
    animation-timeline: --page-scroll;

    overflow-y: scroll;
    height: calc(var(--screen-height) - var(--collapsed-height) - var(--drawer-top-margin));

    @media (min-width: 640px) {
      animation: none;
      height: 100%;
      max-height: calc(
        var(--screen-height) - var(--collapsed-height) - var(--screen-padding) -
          var(--screen-padding)
      );
    }
  }
</style>
