<script lang="ts">
  import { DB } from '$lib/db'
  import { GTFSImport } from '$lib/gtfsImport'
  import { onMount } from 'svelte'

  const db = new DB()
  const gtfsImport = new GTFSImport({ db })
  let connect: Promise<void>

  const getDb = async () => {
    const res = await fetch('/db.bin')
    const data = res.arrayBuffer()
    return data
  }

  onMount(async () => {
    connect = db.connect()
    const dbData = await getDb()
    await connect

    db.load(dbData)
    console.log('existing db loaded')
  })

  let error = ''
  let results = []
  let query = 'select * from stops where stop_name like "%train station"'
  const run = () => {
    error = ''
    try {
      results = db.db.exec(query)
    } catch (err) {
      results = []
      error = err.message
    }
  }

  const triggerImport = async () => {
    const res = await fetch('/stops.txt')
    const data = await res.text()
    gtfsImport.import('stops', data)
  }

  const triggerSave = async () => {
    const handle = await showSaveFilePicker()
    const data = db.db.export()
    const stream = await handle.createWritable()
    await stream.write(data.buffer)
    await stream.close()
    console.log('done!')
  }
</script>

<svelte:head>
  <title>waka-next</title>
</svelte:head>

<h1>waka-next</h1>
{#await connect}
  loading sqllite
{:then}
  <div>
    <button on:click={triggerImport}>trigger import from stops.txt</button>
    <button on:click={triggerSave}>dump db</button>
  </div>
  <div>
    <input type="text" bind:value={query} /> <button on:click={run}>run</button>
  </div>
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
  div {
    margin-bottom: 1rem;
  }
  input {
    width: 400px;
  }
</style>
