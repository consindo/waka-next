<script lang="ts">
  import { page } from '$app/state'

  import type { RouteResult } from '@lib/client'

  interface Props {
    group: { name: string; emoji: string; routes: RouteResult[] }
  }

  let { group }: Props = $props()

  const maxRoutes = 4
  let isExpanded = $state(false)
</script>

<h2>{group.emoji} {group.name}</h2>
<ul>
  {#each group.routes.slice(0, isExpanded ? undefined : maxRoutes) as route (route.routeId)}
    {@const color = route.routeColor !== null ? `background-color: #${route.routeColor};` : ''}
    {@const textColor = route.routeTextColor !== null ? `color: #${route.routeTextColor};` : ''}
    <li>
      <a href="/{page.params.prefix}/routes/{route.routeId}">
        <span>{route.routeLongName ?? route.tripHeadsign ?? ''}</span>
        <strong style={`${color}${textColor}`}>{route.routeShortName}</strong>
      </a>
    </li>
  {/each}
</ul>
{#if !isExpanded && group.routes.length > maxRoutes}
  <button onclick={() => (isExpanded = true)}>Show More</button>
{/if}

<style>
  h2 {
    margin: 1.25em 0 0.5em;
  }
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0 0 0.5rem;
    border: 1px solid var(--surface-border);
    border-radius: calc(var(--base-border-radius) + 1px);
    overflow: hidden;
  }

  li:last-child a {
    border: 0;
  }

  a {
    display: flex;
    padding: 0.5rem;
    text-decoration: none;
    align-items: center;
    background: var(--surface-bg);
    color: var(--surface-text);
    border-bottom: 1px solid var(--surface-border);
    cursor: default;

    &:hover {
      background: var(--surface-bg-hover);
    }

    & span {
      flex: 1;
    }

    & strong {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: var(--base-border-radius);
    }
  }
</style>
