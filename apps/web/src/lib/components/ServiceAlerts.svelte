<script lang="ts">
  import type { transit_realtime } from 'gtfs-realtime-bindings'

  const { serviceAlerts }: { serviceAlerts: transit_realtime.IAlert[] } = $props()
</script>

<details>
  <summary>{serviceAlerts.length} alerts</summary>
  {#each serviceAlerts as alert (alert)}
    {@const translation = alert.headerText?.translation}
    <details>
      <summary
        >{translation && translation.length > 0
          ? (translation.find((i) => i.language === 'en') || translation[0]).text
          : 'Service Alert'}</summary
      >
      <pre>{JSON.stringify(alert, null, 2)}</pre>
    </details>
  {/each}
</details>
