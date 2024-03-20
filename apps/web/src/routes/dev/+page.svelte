<script lang="ts">
  import { onMount } from 'svelte'

  import { DB } from '@lib/db'
  import { getErrorMessage, logger } from '@lib/logger'

  import DatabaseNav from './DatabaseNav.svelte'
  import type { QueryExecResult } from 'sql.js'

  const db = new DB()
  const stream = logger.stream
  let connect: Promise<void>

  onMount(async () => {
    connect = db.connect()
  })

  let error = ''
  let results: QueryExecResult[] = []
  let query = 'select * from stops where stop_name like "%train station%" limit 100'
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
</script>

<svelte:head>
  <title>waka-next</title>
</svelte:head>

{#await connect}
  loading sqllite
{:then}
  <DatabaseNav {db} />
  <div>
    <input type="text" bind:value={query} /> <button on:click={run}>run</button>
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
