<script lang="ts">
  import { DB } from '$lib/db'
  import { onMount } from 'svelte'

  const db = new DB()
  const connect = db.connect()

  const getData = async () => {
    const res = await fetch('/stops.txt')
    const data = res.text()
    return data
  }

  const importToDb = (table: string, data: string) => {
    const rows = data.split('\n')

    const sqlColumns = rows[0]
      .split(',')
      .map((i) => `${i} char`)
      .join(', ')
    db.db.run(`CREATE TABLE ${table} (${sqlColumns});`)

    rows.forEach((row, index) => {
      if (index === 0) return
      if (row.length === 0) return
      const values = row
        .split(',')
        .map((i) => `'${i.split("'").join("''")}'`)
        .join(',')
      try {
        db.db.exec(`INSERT INTO ${table} VALUES (${values});`)
      } catch (err) {
        console.log(err, values)
      }
    })
  }

  onMount(async () => {
    window.db = db
    // window.getData = getData

    await connect
    const data = await getData()
    console.time('startImport')
    importToDb('stops', data)
    console.timeEnd('startImport')
  })

  let results = []
  let query = 'select * from stops where stop_name like "%train station"'
  const run = () => {
    results = db.db.exec(query)
  }
</script>

<svelte:head>
  <title>waka-next</title>
</svelte:head>

<h1>waka-next</h1>
{#await connect}
  loading sqllite
{:then}
  <input type="text" bind:value={query} /> <button on:click={run}>run</button>
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
</style>
