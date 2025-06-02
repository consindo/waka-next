<script lang="ts">
  const { title, subtitle = '' } = $props()
</script>

<header>
  <h1>{title}</h1>
  {#if subtitle !== ''}<h2>{subtitle}</h2>{/if}
</header>
