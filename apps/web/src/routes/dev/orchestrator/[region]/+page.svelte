<script lang="ts">
  import type { PageData } from './$types'
  import RegionList from '../RegionList.svelte'
  export let data: PageData

  let token = ''

  const formatUrl = (url: string) => {
    if (url.includes('//')) {
      return url.split('/').slice(3).join('/')
    }
    return url
  }
</script>

<div class="container">
  <RegionList
    activeRegions={data.activeRegions}
    inactiveRegions={data.inactiveRegions}
    selectedRegion={data.id}
  />

  <div class="active">
    <h1>{data.id}</h1>
    <p>{data.name}</p>
    <h2>active version</h2>
    {#if data.activeRegion}
      <dl>
        <dt>version</dt>
        <dd>{data.activeRegion.etag}</dd>
        <dt>bounds</dt>
        <dd>{JSON.stringify(data.activeRegion.bounds)}</dd>
        <dt>url</dt>
        <dd>
          <a href={data.activeRegion.url}>{formatUrl(data.activeRegion.url)}</a> ({(
            data.activeRegion.size /
            1024 /
            1024
          ).toFixed(2)}MB)
        </dd>
      </dl>
    {:else}
      <p>Region {data.id} is inactive.</p>
    {/if}
    <h2>versions</h2>
    <form method="POST" action="?/import">
      <p>
        <input type="text" name="token" placeholder="auth token" bind:value={token} />
        <button disabled={token === ''}>check & import new version</button>
      </p>
      {#if data.importResult}
        <div class="logs">
          <h3>import result</h3>
          <p>
            <strong>prefix:</strong>
            {data.importResult.prefix}<br />
            <strong>status:</strong>
            {data.importResult.status}
          </p>
          <pre>{data.importResult.logs.join('\n')}</pre>
        </div>
      {/if}
    </form>
    {#if data.versions.length === 0}
      <p>No available versions.</p>
    {/if}
    {#each data.versions as version}
      <h3>{version.version}</h3>
      <dl>
        <dt>date</dt>
        <dd><time>{new Date(version.date).toLocaleString()}</time></dd>
        <dt>etag</dt>
        <dd>{version.etag}</dd>
        <dt>url</dt>
        <dd>
          <a href={version.url}>{formatUrl(version.url)}</a> ({(version.size / 1024 / 1024).toFixed(
            2
          )}MB)
        </dd>
        <form method="POST" action="?/activate">
          <p>
            <input type="hidden" name="token" bind:value={token} />
            <input type="hidden" name="version" value={version.version} />
            <button disabled={token === ''}>set active</button>
          </p>
        </form>
      </dl>
    {/each}
  </div>
</div>

<style>
  .container {
    display: flex;
    gap: 2rem;
  }
  .active {
    overflow-y: hidden;
  }
  .logs {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    background: #f9f9f9;
    border: 1px solid rgba(0, 0, 0, 0.075);
    box-shadow:
      0 3px 6px -1px rgba(0, 0, 0, 0.05),
      0 2px 4px -2px rgba(0, 0, 0, 0.05);
  }
  pre {
    overflow-y: scroll;
  }
  h3 {
    font-size: 1rem;
  }
  strong {
    font-weight: 600;
  }
  dl {
    margin: 0 0 1.75rem;
    display: grid;
    grid-template-columns: 100px 2fr;
    gap: 0.25rem;
    font-size: 1rem;
  }
  dt {
    font-weight: 500;
  }
</style>
