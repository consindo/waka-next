<script lang="ts">
  import { onMount } from 'svelte'
  import { DB } from '$lib/db'
  import { Client } from '$lib/client'

  const db = new DB()
  const db2 = new DB()
  const client = new Client()
  client.addRegion('nz-akl', db)
  client.addRegion('nz-wlg', db2)

  let sqlResult = ''
  let sqlResult2 = ''
  onMount(async () => {
    await db.connect()
    await db2.connect()
    sqlResult = JSON.stringify(client.getStops('all'), null, 2)
    sqlResult2 = JSON.stringify(client.getStops('nz-wlg'), null, 2)
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
  <pre>{sqlResult2}</pre>
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
