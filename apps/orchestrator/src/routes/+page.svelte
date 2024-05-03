<script>
  const routes = [
    { method: 'get', url: '/regions' },
    { method: 'get', url: '/regions/all' },
    { method: 'get', url: '/[region]' },
    { method: 'post', url: '/admin/[region]/activate' },
    { method: 'post', url: '/admin/[region]/import' },
    { method: 'post', url: '/admin/[region]/refresh' },
    { method: 'post', url: '/admin/schedule-update' },
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
