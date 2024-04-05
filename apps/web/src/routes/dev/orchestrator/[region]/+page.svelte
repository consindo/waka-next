<script lang="ts">
  import RegionList from '../RegionList.svelte'
  export let data

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
      </dl>
    {/each}
  </div>
</div>

<style>
  .container {
    display: flex;
    gap: 2rem;
  }
  h3 {
    font-size: 1rem;
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
