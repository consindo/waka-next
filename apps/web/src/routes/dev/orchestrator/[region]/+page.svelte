<script lang="ts">
  import { goto } from '$app/navigation'

  import type { Prefix } from '@lib/client'

  import { createClient } from '$lib/storage'

  import RegionList from '../RegionList.svelte'
  import type { PageData } from './$types'

  interface Props {
    data: PageData
  }

  let { data }: Props = $props()

  let token = $state('')

  const formatUrl = (url: string) => {
    if (url.includes('//')) {
      return url.split('/').slice(3).join('/')
    }
    return url
  }
  const formatSize = (size: number) => {
    if (size > 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(2) + 'MB'
    } else {
      return (size / 1024).toFixed(2) + 'KB'
    }
  }

  const loadDb =
    (version: { region: string; version: string; url: string }) =>
    async (e: MouseEvent & { currentTarget: HTMLButtonElement }) => {
      e.preventDefault()

      // hack
      e.currentTarget.disabled = true
      e.currentTarget.innerText = 'loading...'

      await createClient(version.region as Prefix, version.version, version.url)
      goto(`/dev/query?db=${encodeURIComponent(`${version.region}:${version.version}`)}`)
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
          <a href={data.activeRegion.url}>{formatUrl(data.activeRegion.url)}</a>
          {formatSize(data.activeRegion.size)}
        </dd>
        {#if data.activeRegion.shapesEtag}
          <dt>shapes etag</dt>
          <dd>{data.activeRegion.shapesEtag}</dd>
        {/if}
        {#if data.activeRegion.shapesUrl}
          <dt>shapes url</dt>
          <dd>
            <a href={data.activeRegion.shapesUrl}>{formatUrl(data.activeRegion.shapesUrl)}</a>
            {#if data.activeRegion.shapesSize}
              {formatSize(data.activeRegion.shapesSize)}
            {/if}
          </dd>
        {/if}
      </dl>
      <button onclick={() => window.location.reload()}>refresh</button>
      <button
        onclick={loadDb({
          region: data.id,
          version: 'live',
          url: data.activeRegion.url,
        })}>load into client</button
      >
    {:else}
      <p>Region {data.id} is inactive.</p>
      <button onclick={() => window.location.reload()}>refresh</button>
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
    {#each data.versions as version (version.version)}
      <h3>{version.version}</h3>
      <dl>
        <dt>date</dt>
        <dd>
          <time>{new Date(version.date).toLocaleString()}</time>
          <em
            >({Math.round(
              (new Date().getTime() - new Date(version.date).getTime()) / 1000 / 60 / 60 / 24
            )} days ago)</em
          >
        </dd>
        <dt>etag</dt>
        <dd>{version.etag}</dd>
        <dt>url</dt>
        <dd>
          <a href={version.url}>{formatUrl(version.url)}</a>
          {formatSize(version.size)}
        </dd>
        {#if version.shapesEtag}
          <dt>shapes etag</dt>
          <dd>{version.shapesEtag}</dd>
        {/if}
        {#if version.shapesUrl}
          <dt>shapes url</dt>
          <dd>
            <a href={version.shapesUrl}>{formatUrl(version.shapesUrl)}</a>
            {#if version.shapesSize}
              {formatSize(version.shapesSize)}
            {/if}
          </dd>
        {/if}
      </dl>
      <form method="POST" action="?/activate">
        <p>
          <input type="hidden" name="token" bind:value={token} />
          <input type="hidden" name="version" value={version.version} />
          <button type="submit" disabled={token === ''}>set active</button>
          <button onclick={loadDb(version)}>load into client</button>
        </p>
      </form>
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
    background: var(--surface-bg);
    border: 1px solid var(--surface-border);
    box-shadow:
      0 3px 6px -1px rgba(0, 0, 0, 0.05),
      0 2px 4px -2px rgba(0, 0, 0, 0.05);
  }
  pre {
    overflow-y: scroll;
  }
  h3 {
    font-size: 1rem;
    margin-top: 2rem;
  }
  strong {
    font-weight: 600;
  }
  dl {
    margin: 0 0 1rem;
    display: grid;
    grid-template-columns: 100px 2fr;
    gap: 0.25rem;
    font-size: 1rem;
  }
  dt {
    font-weight: 500;
  }
  button {
    display: inline-block;
  }
</style>
