<script lang="ts">
  import { page } from '$app/stores'
  export let data

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
</script>

<div>
  <a href="/">home</a>
  <h2>gtfs query results - routes {$page.params.prefix}</h2>
  <ul>
    {#each data?.data?.routes || [] as route}
      {@const color = route.routeColor !== null ? `background-color: #${route.routeColor};` : ''}
      {@const textColor = route.routeTextColor !== null ? `color: #${route.routeTextColor};` : ''}
      <li style={`${color}${textColor}`}>
        {mapRouteToEmoji(route.routeType)}
        <strong>{route.routeShortName}</strong>
        {route.routeLongName ? route.routeLongName : ''}
      </li>
    {/each}
  </ul>
</div>

<style>
  div {
    padding: 1rem;
  }
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  li {
    padding: 0.25rem;
  }
</style>
