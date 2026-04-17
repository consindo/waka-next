<script lang="ts">
  import { resolve } from '$app/paths'

  import Header from '$lib/components/Header.svelte'
  import ScrollContainer from '$lib/components/ScrollContainer.svelte'

  import type { PageData } from './$types'

  const images = import.meta.glob('@regions/images/*.avif')
  console.log(images)

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
          {@const image = Object.keys(images).find((i) => i.endsWith(`${city.id}.avif`)) || ''}
          {@const promise = image in images ? images[image]() : 'xxx'}
          {#await promise then i}
            <li>
              <a
                href={resolve(`/?city=${city.id}`)}
                style={i && (i as { default: string }).default
                  ? `--bg: url(${(i as { default: string }).default});`
                  : undefined}
              >
                <h2>{city.title}</h2>
                {#if city.subtitle}
                  <h3>{city.subtitle}</h3>
                {/if}
              </a>
            </li>
          {/await}
        {/each}
      {/each}
    </ul>
  </div>
</ScrollContainer>

<style>
  div {
    padding: 0.75rem;
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
    text-align: center;
    aspect-ratio: 1.75 / 1;

    &:hover {
      opacity: 0.8;
    }
  }
  li a {
    --bg: linear-gradient(#222, #222);
    box-sizing: border-box;
    height: 100%;
    display: block;
    color: #fff;
    text-decoration: none;
    background-color: #222;
    border-radius: 3px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: end;
    background-size: cover;
    background-position: 50% 50%;
    background-image: linear-gradient(#00000000 30%, #000000aa 100%), var(--bg);
    text-shadow: 0 1px 0 #000000aa;
  }
  h2 {
    font-size: 13px;
    font-weight: 500;
    margin: 0;
  }
  h3 {
    font-size: 14px;
    margin: 0;
  }
</style>
