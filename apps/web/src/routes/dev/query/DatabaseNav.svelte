<script lang="ts">
  import type { DB } from '@lib/db'
  import { Importer } from '@lib/importer'
  import { getErrorMessage, logger } from '@lib/logger'

  export let db: DB

  const importer = new Importer({ db })

  let dbElement: HTMLInputElement
  let zipElement: HTMLInputElement
  let dbFiles: FileList
  let zipFiles: FileList

  $: if (dbFiles && dbFiles.length > 0) {
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

  const triggerSave = async () => {
    const handle = await window.showSaveFilePicker()
    const data = db.export()
    const stream = await handle.createWritable()
    await stream.write(data.buffer)
    await stream.close()
    console.log('done!')
  }

  $: if (zipFiles && zipFiles.length > 0) {
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
</script>

<nav>
  <div>
    <select>
      <option>default-db</option>
    </select>
  </div>
  <div>
    <input type="file" bind:this={dbElement} bind:files={dbFiles} />
    <button on:click={() => dbElement.click()}>load db</button>
    <button on:click={triggerSave}>dump db</button>
    <input type="file" bind:this={zipElement} bind:files={zipFiles} accept=".zip,application/zip" />
    <button on:click={() => zipElement.click()}>import gtfs</button>
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
