<script lang="ts">
  import { onMount } from 'svelte'
  import { DB } from '$lib/db'
  import { Client } from '$lib/client'

  const db = new DB()
  const client = new Client()
  client.addRegion('zz-sample1', db)

  let sqlResult = ''
  onMount(async () => {
    const res = await fetch('/sample-feed-1.bin')
    const data = await res.arrayBuffer()
    await db.connect()
    db.load(data)
    sqlResult = JSON.stringify(client.getStops('all'), null, 2)
  })
</script>

<div>
  <h1>waka:next</h1>
  <p>this will eventually be the new waka. however it's long way from being done.</p>
  <ul>
    <li><a href="/dev">developer console</a></li>
    <li><a href="https://github.com/consindo/waka-next">github</a></li>
  </ul>
  <p>
    this page has a smaller bundle size as it doesn't include the importer, but still includes
    sqlite:
  </p>
  <code>select 1 as number</code>:
  <pre>{sqlResult}</pre>
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
