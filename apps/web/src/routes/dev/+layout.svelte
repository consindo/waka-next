<script>
  import { page } from '$app/stores'

  const links = [
    { name: 'query', href: '/dev/query' },
    { name: 'orchestrator', href: '/dev/orchestrator' },
    { name: 'client', href: '/' },
  ]
</script>

<header>
  <h1>waka:next</h1>
  <nav>
    <ul>
      {#each links as link}
        <li>
          <a
            href={link.href}
            class:selected={$page.url.pathname.startsWith(link.href) && link.href.length > 1}
            >{link.name}</a
          >
        </li>
      {/each}
    </ul>
  </nav>
</header>

<main>
  <slot />
</main>

<style>
  header {
    padding: 0.75rem 1.25rem;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  h1 {
    color: rgba(0, 0, 0, 0.6);
    letter-spacing: -0.7px;
    margin: 0;
    font-size: 1.5rem;
    flex: 1;
    font-weight: 600;
  }
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 0.5rem;
  }
  a {
    font-size: 15px;
    text-decoration: none;
    color: #222;
    font-weight: 450;
  }
  a.selected {
    font-weight: 650;
  }
  a:hover {
    text-decoration: underline;
  }
  main {
    padding: 0 1rem;
  }
</style>
