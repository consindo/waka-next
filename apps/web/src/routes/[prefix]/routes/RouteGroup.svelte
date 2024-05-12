<script lang="ts">
  import type { RouteResult } from '@lib/client'
  export let group: { name: string; routes: RouteResult[] }

  const mapRouteToEmoji = (routeType: number) => {
    switch (routeType) {
      case 2:
        return '🚆'
      case 4:
        return '⛴️'
      default:
        return '🚍'
    }
  }

  const maxRoutes = 4
  let isExpanded = false
</script>

<h2>{group.name}</h2>
<ul>
  {#each group.routes.slice(0, isExpanded ? undefined : maxRoutes) as route}
    {@const color = route.routeColor !== null ? `background-color: #${route.routeColor};` : ''}
    {@const textColor = route.routeTextColor !== null ? `color: #${route.routeTextColor};` : ''}
    <li style={`${color}${textColor}`}>
      {mapRouteToEmoji(route.routeType)}
      <strong>{route.routeShortName}</strong>
      {route.routeLongName ? route.routeLongName : ''}
    </li>
  {/each}
</ul>
{#if !isExpanded && group.routes.length > maxRoutes}
  <button on:click={() => (isExpanded = true)}>Show More</button>
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
