<script lang="ts">
  import type { ChangeEventHandler } from 'svelte/elements'

  import type { DB } from '@lib/db'
  import { Importer } from '@lib/importer'
  import { getErrorMessage, logger } from '@lib/logger'

  import { getDatabases } from '$lib/storage'

  interface Props {
    db: DB
    dbName: string | null
    triggerChange: ChangeEventHandler<HTMLSelectElement>
  }

  let { db, dbName, triggerChange }: Props = $props()

  const importer = new Importer({ db })

  let dbElement: HTMLInputElement | undefined = $state()
  let zipElement: HTMLInputElement | undefined = $state()
  let dbFiles: FileList | undefined = $state()
  let zipFiles: FileList | undefined = $state()

  $effect(() => {
    if (dbFiles && dbFiles.length > 0) {
      ;(async () => {
        const data = await new Response(dbFiles[0]).arrayBuffer()
        logger.info(`loading ${dbFiles[0].name} into sqlite`)
        db.reset()
        db.load(data)
        try {
          db.exec('select * from sqlite_schema limit 1')
          logger.info(`loaded ${dbFiles[0].name}`)
        } catch (err) {
          logger.error(getErrorMessage(err))
        }
      })()
    }
  })

  $effect(() => {
    if (zipFiles && zipFiles.length > 0) {
      ;(async () => {
        const data = new Response(zipFiles[0])
        if (data.body == null) {
          logger.error('file could not be loaded')
        } else {
          logger.info(`importing ${zipFiles[0].name}`)
          await importer.import(data.body)
          logger.info(`imported ${zipFiles[0].name}`)
        }
      })()
    }
  })

  const triggerSave = async () => {
    const handle = await window.showSaveFilePicker()
    const data = db.export()
    const stream = await handle.createWritable()
    await stream.write(data.buffer as ArrayBuffer)
    await stream.close()
    console.log('done!')
  }
</script>

<nav>
  <div>
    <select
      onchange={triggerChange}
      value={Object.keys(getDatabases()).includes(dbName || '') ? dbName : 'empty-db'}
    >
      <option>empty-db</option>
      {#each Object.keys(getDatabases()) as key}
        <option>{key}</option>
      {/each}
      }
    </select>
  </div>
  <div>
    <input type="file" bind:this={dbElement} bind:files={dbFiles} />
    <button onclick={() => (dbElement ? dbElement.click() : null)}>load db</button>
    <button onclick={triggerSave}>dump db</button>
    <input type="file" bind:this={zipElement} bind:files={zipFiles} accept=".zip,application/zip" />
    <button onclick={() => (zipElement ? zipElement.click() : null)}>import gtfs</button>
  </div>
</nav>

<style>
  nav {
    display: flex;
    background: #f9f9f9;
    padding: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.075);
    border-radius: 5px;
    margin-bottom: 1rem;
    box-shadow:
      0 3px 6px -1px rgba(0, 0, 0, 0.05),
      0 2px 4px -2px rgba(0, 0, 0, 0.05);
  }
  nav div:first-child {
    flex: 1;
  }
  nav input {
    display: none;
  }
  nav button,
  nav select {
    border: 0;
    background: #fff;
    font-size: 14px;
    padding: 0.25rem 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.075);
    border-radius: 4px;
  }
  nav button:hover {
    background: rgba(0, 0, 0, 0.025);
  }
  nav select {
    min-width: 180px;
  }
</style>
