<script>
  import { page } from '$app/stores'

  const links = [
    { name: 'query', href: '/dev' },
    { name: 'client', href: '/' },
  ]
</script>

<header>
  <h1>waka:next</h1>
  <nav>
    <ul>
      {#each links as link}
        <li>
          <a href={link.href} class:selected={link.href === $page.url.pathname}>{link.name}</a>
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
    padding: 0.5rem 1rem;
    margin-bottom: 0;
    border-bottom: 1px solid #eee;
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
    font-weight: 500;
  }
  a.selected {
    font-weight: 600;
  }
  a:hover {
    text-decoration: underline;
  }
  main {
    padding: 1rem;
  }
</style>
