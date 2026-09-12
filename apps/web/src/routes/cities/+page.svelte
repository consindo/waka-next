<script lang="ts">
  import { resolve } from '$app/paths'

  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'

  import type { PageData } from './$types'

  const images = import.meta.glob('@regions/images/*.avif', { eager: true })

  interface Props {
    data: PageData
  }

  let { data }: Props = $props()
  const { regions } = $derived(data)
</script>

<Header title="Cities" />
<ScrollContainer>
  <div>
    <ul>
      {#each regions as region (region.region)}
        {#each region.cities as city (city.id)}
          {@const image = images[
            Object.keys(images).find((i) => i.endsWith(`${city.id}.avif`)) || ''
          ] as { default: string } | undefined}
          <li>
            <a
              href={resolve(`/?city=${city.id}`)}
              style={image && image.default ? `--bg: url(${image.default});` : undefined}
            >
              <h2>{city.title}</h2>
              {#if city.subtitle}
                <h3>{city.subtitle}</h3>
              {/if}
            </a>
          </li>
        {/each}
      {/each}
    </ul>
  </div>
</ScrollContainer>

<style>
  div {
    padding: var(--edge-padding);
  }
  ul {
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
  }
  li {
    list-style-type: none;
    aspect-ratio: 1.618;
    transition: 100ms ease transform;
    background: var(--surface-bg);

    &:hover {
      opacity: 0.8;
    }
    &:active {
      transform: scale(0.97);
    }
  }
  li a {
    box-shadow:
      0 0 0 1px #00000022 inset,
      var(--surface-shadow);
    border-radius: var(--base-border-radius);
    --bg: linear-gradient(#222, #222);
    cursor: default;
    box-sizing: border-box;
    height: 100%;
    display: block;
    color: #fff;
    text-decoration: none;
    background-color: #222;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: end;
    background-size: cover;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-image: linear-gradient(#00000000 40%, #00000099 100%), var(--bg);
    text-shadow: 0 1px 0 #000000aa;
  }
  h2 {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }
  h3 {
    font-size: 13px;
    font-weight: 500;
    margin: 0;
  }
</style>
