<script lang="ts">
  import { onMount } from 'svelte'
  import { DB } from '@lib/db'
  import { getErrorMessage, logger } from '@lib/logger'

  import { page } from '$app/stores'
  import { getDatabases } from '$lib/storage'

  import DatabaseNav from './DatabaseNav.svelte'
  import type { QueryExecResult } from 'sql.js'

  const emptyDb = new DB()
  let db = emptyDb
  const requestedDb = $page.url.searchParams.get('db')

  const stream = logger.stream
  let connect: Promise<void>

  onMount(async () => {
    connect = db.connect()
    await connect

    // sets the db from the query param
    if (requestedDb != null && getDatabases()[requestedDb] !== undefined) {
      db = getDatabases()[requestedDb]
    }
  })

  let error = ''
  let results: QueryExecResult[] = []
  let query = 'select * from stops limit 100'
  const run = () => {
    error = ''
    try {
      results = db.db!.exec(query)
      console.log(results)
    } catch (err) {
      results = []
      error = getErrorMessage(err)
    }
  }

  const triggerDatabaseChange = (event: CustomEvent<string>) => {
    if (event.detail === 'empty-db') return (db = emptyDb)
    db = getDatabases()[event.detail]
  }

  const triggerKeyup = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      run()
    }
  }
</script>

<svelte:head>
  <title>waka-next</title>
</svelte:head>

{#await connect}
  loading sqllite
{:then}
  <DatabaseNav {db} on:databaseChange={triggerDatabaseChange} dbName={requestedDb} />
  <div>
    <textarea bind:value={query} on:keypress={triggerKeyup}></textarea>
    <button on:click={run}>run</button>
  </div>
  <div>{$stream}</div>
  <div>{error}</div>
  {#each results as result}
    <table>
      <tr>
        {#each result.columns as column}
          <th>{column}</th>
        {/each}
      </tr>
      {#each result.values as row}
        <tr>
          {#each row as value}
            <td>{value}</td>
          {/each}
        </tr>
      {/each}
    </table>
  {/each}
{/await}

<style>
  input {
    width: 400px;
  }
  table {
    font-family: monospace;
    white-space: pre;
    font-size: 11px;
  }
  th {
    text-align: left;
  }
</style>
