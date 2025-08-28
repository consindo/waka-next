<script lang="ts">
  import type { RouteResult } from '@lib/client'

  import { getTextColor } from '$lib/utils/color'

  interface Props {
    group: { name: string; emoji: string; routes: RouteResult[] }
  }

  let { group }: Props = $props()
</script>

<details>
  <summary>
    <h2><span>{group.emoji}</span><span>{group.name}</span><small>{group.routes.length}</small></h2>
  </summary>
  <ul>
    {#each group.routes as route (route.routeId)}
      {@const color = route.routeColor
        ? `background-color: #${route.routeColor};color: ${getTextColor(route.routeColor)}`
        : ''}
      <li>
        <a href="/{route.prefix}/routes/{route.routeId}">
          <span>{route.routeLongName ?? route.tripHeadsign ?? ''}</span>
          <strong style={`${color}`}>{route.routeShortName}</strong>
        </a>
      </li>
    {/each}
  </ul>
</details>

<style>
  details {
    border-radius: calc(var(--base-border-radius) + 1px);
    border: 0.5px solid var(--surface-border);
    background: var(--surface-bg);
    box-shadow: var(--surface-shadow);

    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }

  details summary {
    padding: 0.5rem 0.75rem;
    color: var(--surface-text-subtle);
    cursor: default;
  }
  details summary:hover {
    background: var(--surface-bg-hover);
  }

  h2 {
    margin: 0;
    display: inline-flex;
    font-size: 18px;
    line-height: 1.25rem;
    gap: 0.3em;
    padding: 0.25rem 0.125rem;
    color: var(--surface-text);
  }

  small {
    color: var(--surface-text-subtle);
    font-size: 70%;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
  }

  a {
    display: flex;
    padding: 0.75rem;
    text-decoration: none;
    align-items: center;
    color: var(--surface-text);
    border-top: 0.5px solid var(--surface-border);
    cursor: default;
    gap: 1rem;
    font-size: 14px;
    text-wrap: pretty;

    &:hover {
      background: var(--surface-bg-hover);
    }

    & span {
      flex: 1;
    }

    & strong {
      display: inline-block;
      padding: 0.125rem 0.375rem;
      border-radius: var(--base-border-radius);
      background: var(--surface-bg-hover);
      color: var(--surface-text-subtle);
      font-size: 13px;
    }
  }
</style>
