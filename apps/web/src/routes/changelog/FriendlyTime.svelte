<script lang="ts">
  const { date }: { date: string } = $props()
</script>

<time datetime={date}
  >{new Date(date).toLocaleString(navigator.languages, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}</time
>

<style>
  time {
    color: var(--surface-text-subtle);
    font-size: 13px;
  }
</style>
