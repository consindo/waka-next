<script lang="ts">
  import { DB } from '$lib/db'
  import { onMount } from 'svelte'

  const db = new DB()
  const connect = db.connect()

  const getData = async () => {
    const res = await fetch('/stop_times.txt')
    const data = res.text()
    return data
  }

  const importToDb = (table: string, data: string) => {
    const rows = data.split('\n')
    console.log(rows.length, 'total rows')

    const sqlColumns = rows[0]
      .split(',')
      .map((i) => `${i} char`)
      .join(', ')
    db.db.run(`CREATE TABLE ${table} (${sqlColumns});`)

    const batchSize = 10000
    for (let i = 0; i < Math.floor(rows.length / batchSize); i++) {
      if (i % 5 === 0) console.log(`batch ${i}`)
      const insertion = rows
        .slice(i * batchSize, (i + 1) * batchSize)
        .map((row, index) => {
          if (index === 0) return ''
          if (row.length === 0) return ''
          if (index % 50000 === 0) console.log(index)
          const values = row
            .split(',')
            .map((i) => `'${i.split("'").join("''")}'`)
            .join(',')
          return `INSERT INTO ${table} VALUES (${values});`
        })
        .join('\n')
      db.db.exec(insertion)
    }
  }

  onMount(async () => {
    window.db = db

    await connect
    const data = await getData()

    const run = () => {
      console.time('import')
      importToDb('stoptimes', data)
      console.timeEnd('import')
    }

    const save = async () => {
      const handle = await showSaveFilePicker()
      const data = db.db.export()
      const stream = await handle.createWritable()
      await stream.write(data.buffer)
      await stream.close()
      console.log('done!')
    }

    window.run = run
    window.save = save
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
