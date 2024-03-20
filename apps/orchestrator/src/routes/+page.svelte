<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
</script>

<div>
  <h1>waka:next orchestrator</h1>
  <p>this also runs sqlite, but on the server (GET /data)</p>
  <pre>{JSON.stringify(data.data, undefined, 2)}</pre>
</div>
