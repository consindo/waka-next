<script lang="ts">
  import { onMount } from 'svelte'
  import { waitForClient } from '../lib/storage.js'

  export let data

  let renderedContent = data.data
  if (renderedContent === null) {
    onMount(async () => {
      const client = await waitForClient
      renderedContent = client.getStops('all')
    })
  }
</script>

<div>
  <h1>waka:next</h1>
  <p>this will eventually be the new waka. however it's long way from being done.</p>
  <ul>
    <li><a href="/dev">developer console</a></li>
    <li><a href="https://github.com/consindo/waka-next">github</a></li>
  </ul>
  <p>
    this page will prerender and return data via HTTP, and then start downloading the sqlite
    database in the background for subsequent requests (navigate to another page and then back here,
    and notice how the provider changes).
  </p>
  <p>
    apps/orchestrator is not deployed yet, so it is likely the provider will be 'static' for now
  </p>
  <h2>gtfs query results</h2>
  <p>provider: {data.provider}</p>
  <pre>{JSON.stringify(renderedContent, undefined, 2)}</pre>
</div>

<style>
  div {
    padding: 1rem;
  }
</style>
