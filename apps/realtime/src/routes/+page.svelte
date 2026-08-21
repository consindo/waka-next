<script>
  const routes = [{ method: 'get', url: '/regions' }]
</script>

<div>
  <h1>waka-realtime</h1>
  <h2>api routes</h2>
  <ul>
    {#each routes as route (route.url)}
      <li><em>{route.method}</em> <a href={route.url}>{route.url}</a></li>
    {/each}
  </ul>
</div>

<style>
  div {
    font-family: monospace;
  }
  em {
    text-transform: uppercase;
  }
</style>
