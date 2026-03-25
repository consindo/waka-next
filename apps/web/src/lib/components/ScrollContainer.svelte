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
  div {
    overflow-y: scroll;
    max-height: calc(
      var(--screen-height) - var(--collapsed-height) - var(--screen-padding) - var(--screen-padding)
    );
  }
</style>
