<script lang="ts">
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
  {#each group.routes.slice(0, isExpanded ? undefined : maxRoutes) as route}
    {@const color = route.routeColor !== null ? `background-color: #${route.routeColor};` : ''}
    {@const textColor = route.routeTextColor !== null ? `color: #${route.routeTextColor};` : ''}
    <li style={`${color}${textColor}`}>
      <strong>{route.routeShortName}</strong>
      {route.routeLongName ? route.routeLongName : ''}
    </li>
  {/each}
</ul>
{#if !isExpanded && group.routes.length > maxRoutes}
  <button onclick={() => (isExpanded = true)}>Show More</button>
{/if}

<style>
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  li {
    padding: 0.25rem;
  }
</style>
