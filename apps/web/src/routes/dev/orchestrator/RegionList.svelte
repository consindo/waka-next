<script lang="ts">
  import type { ActiveRegion, InactiveRegion } from './types'

  interface Props {
    activeRegions: ActiveRegion[]
    inactiveRegions: InactiveRegion[]
    selectedRegion?: string
  }

  let { activeRegions, inactiveRegions, selectedRegion = '' }: Props = $props()
</script>

<div class="regions">
  <h2>active regions</h2>
  <ul>
    {#each activeRegions as region}
      <li class:selected={selectedRegion === region.region}>
        <a href="/dev/orchestrator/{region.region}">
          <h3>{region.region}</h3>
          <code>{region.etag}</code></a
        >
      </li>
    {/each}
  </ul>
  {#if inactiveRegions}
    <h2>inactive regions</h2>
    <ul>
      {#each inactiveRegions as region}
        <li class:selected={selectedRegion === region.region}>
          <a href="/dev/orchestrator/{region.region}"> <h3>{region.region}</h3></a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .regions {
    max-width: 200px;
    min-height: 200px;
    width: 100%;
    background: var(--surface-bg-subtle);
    border-radius: 5px;
    padding: 0.5rem;
    border: 1px solid var(--surface-border);
    box-shadow:
      0 3px 6px -1px rgba(0, 0, 0, 0.05),
      0 2px 4px -2px rgba(0, 0, 0, 0.05);
  }
  h2 {
    font-size: 14px;
    margin: 0;
    font-weight: 600;
    color: var(--surface-text);
    text-shadow: var(--surface-text-shadow);
    padding: 0.25rem 0.25rem 0;
  }
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0.5rem 0;
  }
  h3 {
    font-size: 15px;
    margin: 0;
  }
  li {
    margin-bottom: 1px;
  }
  a {
    display: block;
    text-decoration: none;
    color: var(--surface-text);
    border: 1px solid transparent;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
  .selected a,
  a:hover {
    background: var(--surface-bg);
    border: 1px solid var(--surface-border);
  }
  code {
    font-size: 0.75rem;
    text-overflow: ellipsis;
    overflow: hidden;
    display: block;
  }
</style>
