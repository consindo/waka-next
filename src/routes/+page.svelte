<script lang="ts">
  import { onMount } from 'svelte'
  import { DB } from '$lib/db'
  import { Client } from '$lib/client'

  const db = new DB()
  const client = new Client({ db })
  let connect: Promise<void>

  let sqlResult = ''
  onMount(async () => {
    connect = await db.connect()
    sqlResult = JSON.stringify(client.getStops(), null, 2)
  })
</script>

<h1>waka-next</h1>
<p>this is the client, it has a smaller bundle as it does not include the importer</p>
<a href="/dev">/dev</a>

<div>
  {sqlResult}
</div>
