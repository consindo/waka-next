<script>
  const routes = [
    { method: 'get', url: '/regions' },
    { method: 'get', url: '/regions/all' },
    { method: 'get', url: '/[region]' },
    { method: 'post', url: '/[region]/admin/activate' },
    { method: 'post', url: '/[region]/admin/import' },
  ]
</script>

<div>
  <h1>waka-next-orchestrator</h1>
  <h2>api routes</h2>
  <ul>
    {#each routes as route}
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
