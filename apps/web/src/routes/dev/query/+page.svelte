<script lang="ts">
  import { page } from '$app/state'
  import type { QueryExecResult } from 'sql.js'
  import { onMount } from 'svelte'

  import { DB } from '@lib/db'
  import { getErrorMessage, logger } from '@lib/logger'

  import { getDatabases } from '$lib/storage'

  import DatabaseNav from './DatabaseNav.svelte'

  const emptyDb = new DB()
  let db = emptyDb
  const requestedDb = page.url.searchParams.get('db')

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

  const triggerDatabaseChange = (event: Event & { currentTarget: HTMLSelectElement }) => {
    const value = event.currentTarget.value
    if (value === 'empty-db') return (db = emptyDb)
    db = getDatabases()[value]
  }

  const triggerKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
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
  <DatabaseNav {db} triggerChange={triggerDatabaseChange} dbName={requestedDb} />
  <div>
    <textarea bind:value={query} on:keydown={triggerKeydown} rows="5"></textarea>
    <button on:click={run}>run (ctrl+enter)</button>
  </div>
  <div>{$stream}</div>
  <div>{error}</div>
  {#each results as result}
    <table>
      <thead>
        <tr>
          {#each result.columns as column}
            <th>{column}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each result.values as row}
          <tr>
            {#each row as value}
              <td>{value}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/each}
{/await}

<style>
  textarea {
    width: 400px;
  }
  button {
    vertical-align: top;
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
