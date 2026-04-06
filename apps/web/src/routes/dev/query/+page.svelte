<script lang="ts">
  import { page } from '$app/state'
  import type { QueryExecResult } from 'sql.js'
  import { onMount } from 'svelte'

  import { DB } from '@lib/db'
  import { getErrorMessage, logger } from '@lib/logger'

  import { getDatabases } from '$lib/storage'

  import DatabaseNav from './DatabaseNav.svelte'

  const emptyDb = new DB()
  let db = $state(emptyDb)
  let querySpeed = $state(-1)
  const requestedDb = page.url.searchParams.get('db')

  const stream = logger.stream
  let connect: Promise<void> | undefined = $state()

  onMount(async () => {
    connect = db.connect()
    await connect

    // sets the db from the query param
    if (requestedDb != null && getDatabases()[requestedDb] !== undefined) {
      db = getDatabases()[requestedDb]
    }
  })

  let error = $state('')
  let results: QueryExecResult[] = $state([])
  let query = $state('select * from stops limit 100')
  const run = () => {
    error = ''
    try {
      if (db.db === undefined) {
        throw new Error('db.db not found')
      }
      const startTime = performance.now()
      const queryResults = db.db.exec(query)
      const endTime = performance.now()
      console.log(queryResults)
      results = queryResults
      querySpeed = endTime - startTime
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
  loading sqlite
{:then}
  <DatabaseNav {db} triggerChange={triggerDatabaseChange} dbName={requestedDb} />
  <div class="query">
    <textarea bind:value={query} onkeydown={triggerKeydown} rows="5"></textarea>
    <div>
      <button class="dev-btn" onclick={run}>run query (ctrl+enter)</button>
      {#if querySpeed >= 0}
        {@const resultCount = results.reduce((acc, cur) => acc + cur.values.length, 0)}
        <div class="result-count">
          {resultCount}
          {resultCount === 1 ? 'result' : 'results'} ({querySpeed.toFixed(1)}ms)
        </div>
      {/if}
    </div>
  </div>
  <div>{$stream}</div>
  <div>{error}</div>
  <div class="results">
    {#each results as result, i (i)}
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
  </div>
{/await}

<style>
  .query {
    display: flex;
    gap: 0.5rem;
    margin-bottom: var(--edge-padding);
  }
  textarea {
    flex: 1;
    background: var(--surface-bg);
    border: 0.5px solid var(--surface-border);
    padding: 0.5rem;
    border-radius: var(--base-border-radius);
  }
  button {
    vertical-align: top;
  }
  .result-count {
    text-align: right;
    font-size: 11px;
    padding: 0.25rem 0;
    color: var(--surface-text-subtle);
  }
  table {
    font-family: monospace;
    white-space: nowrap;
    font-size: 11px;
    background: var(--surface-bg);
    border: 0.5px solid var(--surface-border);
    width: 100%;
    display: block;
    overflow-x: auto;
    overflow-y: hidden;
    border-collapse: collapse;
    margin-bottom: 1rem;
    border-radius: var(--base-border-radius);
  }
  tr {
    border: none;

    &:nth-child(even) {
      background: var(--surface-bg-subtle);
    }
  }
  th {
    border-bottom: 0.5px solid var(--surface-border);
  }
  td,
  th {
    padding: 0.125rem 0.25rem;
    border-right: 0.5px solid var(--surface-border);
    border-left: 0.5px solid var(--surface-border);

    &:first-child {
      border-left: 0;
    }
  }
  th {
    text-align: left;
  }
</style>
