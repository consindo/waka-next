<script>
  import { DB } from '$lib/db'
  import { onMount } from 'svelte'

  const db = new DB()
  const connect = db.connect()

  onMount(() => {
    window.db = db
  })
</script>

<svelte:head>
  <title>waka-next</title>
</svelte:head>

<h1>waka-next</h1>
{#await connect}
  loading sqllite
{:then}
  <pre>{JSON.stringify(db.exec('select 1 as number, 2 as banana'), null, 2)}</pre>
{/await}
