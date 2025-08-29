<script lang="ts">
  import { page } from '$app/state'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()

  const links = [
    { name: 'orchestrator', href: '/dev/orchestrator' },
    { name: 'sql', href: '/dev/query' },
  ]
</script>

<header>
  <h1><a href="/">waka:next</a></h1>
  <nav>
    <ul>
      {#each links as link (link.href)}
        <li>
          <a href={link.href} class:selected={page.url.pathname.startsWith(link.href)}
            >{link.name}</a
          >
        </li>
      {/each}
    </ul>
  </nav>
</header>

<div>
  {@render children?.()}
</div>

<style>
  header {
    padding: calc(var(--edge-padding) - 0.25rem) var(--edge-padding);
    margin-bottom: 0;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  h1 {
    letter-spacing: -0.7px;
    margin: 0;
    font-size: 1.25rem;
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
    color: var(--surface-text);
    text-decoration: none;
  }
  li a {
    font-size: 14px;
    color: var(--surface-text);
    font-weight: 450;
  }
  a.selected {
    font-weight: 650;
  }
  a:hover {
    text-decoration: underline;
  }
  div {
    padding: 0 var(--edge-padding) var(--edge-padding);
  }
</style>
